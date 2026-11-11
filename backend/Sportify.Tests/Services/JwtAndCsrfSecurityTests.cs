using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Sportify.Api.Middlewares;
using Sportify.Infrastructure.Authentication;

namespace Sportify.Tests.Services;

public class JwtAndCsrfSecurityTests
{
    private static JwtTokenService CreateTokenService()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JwtSettings:Secret"] = "SPORTIFY_TEST_JWT_AND_CSRF_SECRET_KEY_2026_SECURE!",
                ["JwtSettings:Issuer"] = "SportifyApi",
                ["JwtSettings:Audience"] = "SportifyClients",
                ["JwtSettings:ExpirationMinutes"] = "60"
            })
            .Build();

        return new JwtTokenService(config);
    }

    [Fact]
    public void GenerateToken_Y_ValidateJwtToken_ValidaFirmaYClaimsCorrectamente()
    {
        var service = CreateTokenService();
        var jwt = service.GenerateToken(userId: 7, email: "carlos@sportify.com", role: "CONTADOR");

        var isValid = service.ValidateJwtToken(jwt, out var userId, out var role);

        Assert.True(isValid);
        Assert.Equal(7, userId);
        Assert.Equal("CONTADOR", role);
        Assert.False(service.ValidateJwtToken(jwt + "tampered", out _, out _));
    }

    [Fact]
    public void GenerateCsrfToken_Y_ValidateCsrfToken_VerificaIntegridadYVinculoDeUsuario()
    {
        var service = CreateTokenService();
        var csrf = service.GenerateCsrfToken(userId: 4);

        Assert.True(service.ValidateCsrfToken(csrf, expectedUserId: 4));
        Assert.False(service.ValidateCsrfToken(csrf, expectedUserId: 99));
        Assert.False(service.ValidateCsrfToken(csrf + "x", expectedUserId: 4));
    }

    [Fact]
    public async Task CsrfValidationMiddleware_TokenAlteradoEnPost_Retorna403Forbidden()
    {
        var service = CreateTokenService();
        var nextCalled = false;
        var middleware = new CsrfValidationMiddleware(_ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        var context = new DefaultHttpContext();
        context.Request.Method = HttpMethods.Post;
        context.Request.Path = "/api/payments";
        context.Request.Headers["X-CSRF-TOKEN"] = "token.invalido";
        context.User = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "4")
        }, "TestAuth"));
        context.Response.Body = new MemoryStream();

        await middleware.InvokeAsync(context, service);

        Assert.False(nextCalled);
        Assert.Equal(StatusCodes.Status403Forbidden, context.Response.StatusCode);
    }

    [Fact]
    public async Task CsrfValidationMiddleware_TokenValidoEnPost_PermiteEjecucion()
    {
        var service = CreateTokenService();
        var validCsrf = service.GenerateCsrfToken(userId: 4);
        var nextCalled = false;
        var middleware = new CsrfValidationMiddleware(_ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });

        var context = new DefaultHttpContext();
        context.Request.Method = HttpMethods.Post;
        context.Request.Path = "/api/payments";
        context.Request.Headers["X-CSRF-TOKEN"] = validCsrf;
        context.User = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "4")
        }, "TestAuth"));

        await middleware.InvokeAsync(context, service);

        Assert.True(nextCalled);
    }
}
