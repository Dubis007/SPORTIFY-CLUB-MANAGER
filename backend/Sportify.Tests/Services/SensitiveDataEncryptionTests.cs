using Microsoft.Extensions.Configuration;
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

    // Las pruebas que cambian la llave vigente viven en esta clase: xUnit ejecuta en serie las pruebas de una
    // misma clase, así que ninguna otra prueba de cifrado corre mientras la llave está cambiada.
    private const string LlavePropia = "k9Qw2rT7yU1iO5pA8sD3fG6hJ0kL4zX9cV2bN7mQ1wE5";

    [Fact]
    public void ConfigureMasterKey_LosConversoresDeEfCifranConLaLlaveConfigurada()
    {
        var converter = new EncryptedStringConverter();
        var toProvider = converter.ConvertToProviderExpression.Compile();
        var fromProvider = converter.ConvertFromProviderExpression.Compile();
        var original = "Calle 100 # 15-20";

        try
        {
            AesSensitiveDataProtector.ConfigureMasterKey(LlavePropia);
            var storedInDb = toProvider(original);

            Assert.Equal(original, fromProvider(storedInDb));

            // Con otra llave el dato ya no se puede leer: antes los conversores ignoraban la llave configurada
            AesSensitiveDataProtector.ConfigureMasterKey("otra-llave-maestra-distinta-de-32-caracteres!!");
            Assert.NotEqual(original, fromProvider(storedInDb));

            // Tampoco con la llave heredada, que es pública
            AesSensitiveDataProtector.ConfigureMasterKey(null);
            Assert.NotEqual(original, fromProvider(storedInDb));
        }
        finally
        {
            AesSensitiveDataProtector.ConfigureMasterKey(null);
        }
    }

    [Fact]
    public void ConfigureMasterKey_LosDatosCifradosConLaLlaveHeredadaSiguenLeyendose()
    {
        var converter = new NullableEncryptedStringConverter();
        var toProvider = converter.ConvertToProviderExpression.Compile();
        var fromProvider = converter.ConvertFromProviderExpression.Compile();
        var original = "Lesión de rodilla: reposo de dos semanas";

        try
        {
            // Registro guardado antes de que la llave fuera configurable
            AesSensitiveDataProtector.ConfigureMasterKey(null);
            var legacyRow = toProvider(original);

            AesSensitiveDataProtector.ConfigureMasterKey(LlavePropia);

            Assert.Equal(original, fromProvider(legacyRow));

            // Al volver a guardarse queda cifrado con la llave propia
            var rewritten = toProvider(original)!;
            AesSensitiveDataProtector.ConfigureMasterKey(null);
            Assert.NotEqual(original, fromProvider(rewritten));
        }
        finally
        {
            AesSensitiveDataProtector.ConfigureMasterKey(null);
        }
    }

    [Fact]
    public void Protector_ConLlaveMaestraEnConfiguracion_NoDependeDelSecretoJwt()
    {
        var conLlave = new AesSensitiveDataProtector(new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["EncryptionSettings:MasterKey"] = LlavePropia,
                ["JwtSettings:Secret"] = "un-secreto-jwt-cualquiera-de-32-caracteres!!"
            })
            .Build());
        var soloJwt = new AesSensitiveDataProtector(new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JwtSettings:Secret"] = LlavePropia
            })
            .Build());

        var cifrado = conLlave.Encrypt("dato sensible");

        Assert.Equal("dato sensible", conLlave.Decrypt(cifrado));
        // El secreto de firma de los JWT ya no se reutiliza como llave de cifrado
        Assert.NotEqual("dato sensible", soloJwt.Decrypt(cifrado));
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
