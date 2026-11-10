namespace Sportify.Application.Interfaces;

/// <summary>
/// Contrato de protección criptográfica (AES-256) para cifrar y descifrar datos sensibles en reposo.
/// </summary>
public interface ISensitiveDataProtector
{
    /// <summary>Cifra una cadena en texto plano empleando AES-256 autenticado.</summary>
    string Encrypt(string plainText);

    /// <summary>Descifra una cadena previamente cifrada o devuelve el valor original si no posee prefijo de cifrado.</summary>
    string Decrypt(string cipherText);
}
