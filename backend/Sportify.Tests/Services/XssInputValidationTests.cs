using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Sportify.Api.Filters;
using Sportify.Application.DTOs.Competitions;
using Sportify.Application.Security;

namespace Sportify.Tests.Services;

public class XssInputValidationTests
{
    [Theory]
    [InlineData("<script>alert('xss')</script>")]
    [InlineData("<img src=x onerror=alert(1)>")]
    [InlineData("javascript:alert(document.cookie)")]
    [InlineData("<iframe src='https://evil.test'></iframe>")]
    [InlineData("Torneo <svg onload=eval('1')>")]
    public void ValidateAndSanitize_DetectaVectoresXssPeligrosos_YLanzaArgumentException(string maliciousInput)
    {
        Assert.True(XssSanitizer.ContainsDangerousXssPayload(maliciousInput));
        Assert.Throws<ArgumentException>(() => XssSanitizer.ValidateAndSanitize(maliciousInput, "Nombre"));
    }

    [Fact]
    public void Sanitize_LimpiaEtiquetasHtmlResiduales_YConservaTextoEspanolValido()
    {
        var raw = "  <b>Torneo Relámpago Infantil 2026</b> — Categoría Sub-15  ";
        var clean = XssSanitizer.Sanitize(raw);

        Assert.Equal("Torneo Relámpago Infantil 2026 — Categoría Sub-15", clean);
    }

    [Fact]
    public void XssInputValidationFilter_DtoConPayloadXss_RetornaBadRequest400()
    {
        var filter = new XssInputValidationFilter();
        var dto = new SaveCompetitionDto
        {
            Nombre = "Copa Norte <script>stealToken()</script>",
            Ubicacion = "Sede Principal",
            FechaInicio = DateTime.UtcNow,
            FechaFin = DateTime.UtcNow.AddDays(1)
        };

        var actionContext = new ActionContext(
            new DefaultHttpContext(),
            new RouteData(),
            new ActionDescriptor());

        var executingContext = new ActionExecutingContext(
            actionContext,
            new List<IFilterMetadata>(),
            new Dictionary<string, object?> { ["dto"] = dto },
            controller: new object());

        filter.OnActionExecuting(executingContext);

        var badRequest = Assert.IsType<BadRequestObjectResult>(executingContext.Result);
        Assert.Equal(StatusCodes.Status400BadRequest, badRequest.StatusCode ?? StatusCodes.Status400BadRequest);
    }

    [Fact]
    public void XssInputValidationFilter_DtoConMarcadoInofensivo_SanitizaCamposYPermiteContinuar()
    {
        var filter = new XssInputValidationFilter();
        var dto = new SaveCompetitionDto
        {
            Nombre = "  <i>Copa Élite 2026</i>  ",
            Descripcion = "<span>Fase clasificatoria</span>",
            Ubicacion = "Bogotá D.C.",
            FechaInicio = DateTime.UtcNow,
            FechaFin = DateTime.UtcNow.AddDays(1)
        };

        var actionContext = new ActionContext(
            new DefaultHttpContext(),
            new RouteData(),
            new ActionDescriptor());

        var executingContext = new ActionExecutingContext(
            actionContext,
            new List<IFilterMetadata>(),
            new Dictionary<string, object?> { ["dto"] = dto },
            controller: new object());

        filter.OnActionExecuting(executingContext);

        Assert.Null(executingContext.Result);
        Assert.Equal("Copa Élite 2026", dto.Nombre);
        Assert.Equal("Fase clasificatoria", dto.Descripcion);
    }
}
