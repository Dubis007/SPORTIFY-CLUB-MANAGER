using Sportify.Infrastructure.Security;

namespace Sportify.Tests.Services;

public class SensitiveDataEncryptionTests
{
    [Fact]
    public void EncryptAndDecrypt_SensitiveData_PerformsAuthenticatedAes256RoundTrip()
    {
        var protector = new AesSensitiveDataProtector();
        var plainText = "Calle 100 # 15-20 - Tel: +57 3001234567";

        var encrypted = protector.Encrypt(plainText);

        Assert.NotEqual(plainText, encrypted);
        Assert.StartsWith(AesSensitiveDataProtector.Prefix, encrypted);

        var decrypted = protector.Decrypt(encrypted);
        Assert.Equal(plainText, decrypted);
    }

    [Fact]
    public void EncryptedStringConverter_ConvertsToDatabaseAndBackTransparently()
    {
        var converter = new EncryptedStringConverter();
        var toProvider = converter.ConvertToProviderExpression.Compile();
        var fromProvider = converter.ConvertFromProviderExpression.Compile();

        var original = "Nota médica confidencial: esguince grado 1";
        var storedInDb = toProvider(original);

        Assert.StartsWith("enc:v1:", storedInDb);
        Assert.DoesNotContain("esguince", storedInDb);

        var restored = fromProvider(storedInDb);
        Assert.Equal(original, restored);
    }

    [Fact]
    public void Decrypt_UnencryptedLegacyDatabaseValue_ReturnsOriginalWithoutError()
    {
        var protector = new AesSensitiveDataProtector();
        var legacyPlain = "Sede Principal Norte - Sin Cifrar";

        var result = protector.Decrypt(legacyPlain);

        Assert.Equal(legacyPlain, result);
    }

    [Fact]
    public void BCryptPasswordHash_GeneratesSaltedHashAndVerifiesCorrectly()
    {
        var plainPassword = "Clav3SeguraSportify2026!";
        var hash1 = BCrypt.Net.BCrypt.HashPassword(plainPassword, workFactor: 11);
        var hash2 = BCrypt.Net.BCrypt.HashPassword(plainPassword, workFactor: 11);

        Assert.NotEqual(plainPassword, hash1);
        Assert.NotEqual(hash1, hash2); // Salts distintos por cada hash
        Assert.True(BCrypt.Net.BCrypt.Verify(plainPassword, hash1));
        Assert.True(BCrypt.Net.BCrypt.Verify(plainPassword, hash2));
        Assert.False(BCrypt.Net.BCrypt.Verify("ClaveIncorrecta", hash1));
    }
}
