using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Microsoft.Extensions.Configuration;
using Sportify.Application.Interfaces;

namespace Sportify.Infrastructure.Security;

/// <summary>
/// Implementación de cifrado simétrico autenticado AES-256-GCM para proteger datos sensibles en la base de datos.
/// </summary>
public class AesSensitiveDataProtector : ISensitiveDataProtector
{
    public const string Prefix = "enc:v1:";
    private const int NonceSize = 12; // 96 bits recomendados para AES-GCM
    private const int TagSize = 16;   // 128 bits de etiqueta de autenticación

    /// <summary>
    /// Llave con la que se cifró todo antes de que la llave maestra fuera configurable. Está publicada en el
    /// repositorio, así que ya no se usa para cifrar fuera de desarrollo: solo permite seguir leyendo los
    /// registros que se guardaron con ella. Cada registro se vuelve a cifrar con la llave vigente al actualizarse.
    /// </summary>
    private static readonly byte[] LegacyDerivedKey = SHA256.HashData(
        Encoding.UTF8.GetBytes("SPORTIFY_AES256_DEFAULT_DATA_PROTECTION_KEY_2026!"));

    // Llave vigente para los conversores de EF, que se crean sin inyección de dependencias.
    private static byte[] _activeKey = LegacyDerivedKey;

    private readonly byte[] _key;

    /// <summary>
    /// Fija la llave maestra con la que los conversores de EF cifran y descifran. La API la configura una vez
    /// al arrancar, con el valor validado de EncryptionSettings:MasterKey. Con null vuelve a la llave heredada
    /// (solo para pruebas).
    /// </summary>
    public static void ConfigureMasterKey(string? masterKey)
    {
        var key = string.IsNullOrWhiteSpace(masterKey) ? LegacyDerivedKey : DeriveKey(masterKey);
        Volatile.Write(ref _activeKey, key);
    }

    public AesSensitiveDataProtector(IConfiguration? configuration = null)
    {
        var rawKey = configuration?["EncryptionSettings:MasterKey"];

        _key = !string.IsNullOrWhiteSpace(rawKey)
            ? DeriveKey(rawKey)
            : Volatile.Read(ref _activeKey);
    }

    public string Encrypt(string plainText) => EncryptStatic(plainText, _key);

    public string Decrypt(string cipherText) => DecryptStatic(cipherText, _key);

    private static byte[] DeriveKey(string masterKey) => SHA256.HashData(Encoding.UTF8.GetBytes(masterKey.Trim()));

    public static string EncryptStatic(string plainText, byte[]? key = null)
    {
        if (string.IsNullOrEmpty(plainText))
            return plainText;

        // Evitar doble cifrado si ya tiene el prefijo
        if (plainText.StartsWith(Prefix, StringComparison.Ordinal))
            return plainText;

        var activeKey = key ?? Volatile.Read(ref _activeKey);
        var plainBytes = Encoding.UTF8.GetBytes(plainText);
        var nonce = RandomNumberGenerator.GetBytes(NonceSize);
        var cipherBytes = new byte[plainBytes.Length];
        var tag = new byte[TagSize];

        using var aesGcm = new AesGcm(activeKey, TagSize);
        aesGcm.Encrypt(nonce, plainBytes, cipherBytes, tag);

        var combined = new byte[NonceSize + TagSize + cipherBytes.Length];
        Buffer.BlockCopy(nonce, 0, combined, 0, NonceSize);
        Buffer.BlockCopy(tag, 0, combined, NonceSize, TagSize);
        Buffer.BlockCopy(cipherBytes, 0, combined, NonceSize + TagSize, cipherBytes.Length);

        return Prefix + Convert.ToBase64String(combined);
    }

    public static string DecryptStatic(string cipherText, byte[]? key = null)
    {
        if (string.IsNullOrEmpty(cipherText))
            return cipherText;

        // Compatibilidad con registros históricos no cifrados en BD
        if (!cipherText.StartsWith(Prefix, StringComparison.Ordinal))
            return cipherText;

        var activeKey = key ?? Volatile.Read(ref _activeKey);

        try
        {
            var payloadBase64 = cipherText[Prefix.Length..];
            var combined = Convert.FromBase64String(payloadBase64);

            if (combined.Length < NonceSize + TagSize)
                return cipherText;

            var nonce = combined.AsSpan(0, NonceSize);
            var tag = combined.AsSpan(NonceSize, TagSize);
            var cipherBytes = combined.AsSpan(NonceSize + TagSize);
            var plainBytes = new byte[cipherBytes.Length];

            using var aesGcm = new AesGcm(activeKey, TagSize);
            aesGcm.Decrypt(nonce, cipherBytes, tag, plainBytes);

            return Encoding.UTF8.GetString(plainBytes);
        }
        catch (CryptographicException)
        {
            // Registro guardado antes de configurar una llave propia: se lee con la llave heredada
            if (!activeKey.AsSpan().SequenceEqual(LegacyDerivedKey))
            {
                return DecryptStatic(cipherText, LegacyDerivedKey);
            }
            return cipherText;
        }
        catch (FormatException)
        {
            return cipherText;
        }
    }
}

/// <summary>
/// ValueConverter de Entity Framework Core para cifrar automáticamente propiedades string no nulas en reposo.
/// Usa la llave maestra configurada con <see cref="AesSensitiveDataProtector.ConfigureMasterKey"/>.
/// </summary>
public sealed class EncryptedStringConverter : ValueConverter<string, string>
{
    public EncryptedStringConverter()
        : base(
            plain => AesSensitiveDataProtector.EncryptStatic(plain, null),
            cipher => AesSensitiveDataProtector.DecryptStatic(cipher, null))
    {
    }
}

/// <summary>
/// ValueConverter de Entity Framework Core para cifrar automáticamente propiedades string anulables en reposo.
/// Usa la llave maestra configurada con <see cref="AesSensitiveDataProtector.ConfigureMasterKey"/>.
/// </summary>
public sealed class NullableEncryptedStringConverter : ValueConverter<string?, string?>
{
    public NullableEncryptedStringConverter()
        : base(
            plain => plain == null ? null : AesSensitiveDataProtector.EncryptStatic(plain, null),
            cipher => cipher == null ? null : AesSensitiveDataProtector.DecryptStatic(cipher, null))
    {
    }
}
