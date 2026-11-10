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

    private static readonly byte[] DefaultDerivedKey = SHA256.HashData(
        Encoding.UTF8.GetBytes("SPORTIFY_AES256_DEFAULT_DATA_PROTECTION_KEY_2026!"));

    private readonly byte[] _key;

    public AesSensitiveDataProtector(IConfiguration? configuration = null)
    {
        var rawKey = configuration?["EncryptionSettings:MasterKey"]
                  ?? configuration?["JwtSettings:Secret"];

        _key = !string.IsNullOrWhiteSpace(rawKey)
            ? SHA256.HashData(Encoding.UTF8.GetBytes(rawKey))
            : DefaultDerivedKey;
    }

    public string Encrypt(string plainText) => EncryptStatic(plainText, _key);

    public string Decrypt(string cipherText) => DecryptStatic(cipherText, _key);

    public static string EncryptStatic(string plainText, byte[]? key = null)
    {
        if (string.IsNullOrEmpty(plainText))
            return plainText;

        // Evitar doble cifrado si ya tiene el prefijo
        if (plainText.StartsWith(Prefix, StringComparison.Ordinal))
            return plainText;

        var activeKey = key ?? DefaultDerivedKey;
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

        try
        {
            var activeKey = key ?? DefaultDerivedKey;
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
            // Fallback con llave por defecto si fue cifrado por seeder estático
            if (key is not null && !key.SequenceEqual(DefaultDerivedKey))
            {
                return DecryptStatic(cipherText, DefaultDerivedKey);
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
