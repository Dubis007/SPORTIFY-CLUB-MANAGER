namespace Sportify.Application.DTOs.Common;

/// <summary>Parámetros de paginación recibidos por query string (?page=1&amp;pageSize=10).</summary>
public class PaginationParams
{
    public const int DefaultPageSize = 10;
    public const int MaxPageSize = 100;

    private int _page = 1;
    private int _pageSize = DefaultPageSize;

    /// <summary>Número de página (base 1). Valores menores a 1 se ajustan a 1.</summary>
    public int Page
    {
        get => _page;
        set => _page = value < 1 ? 1 : value;
    }

    /// <summary>Registros por página. Se ajusta al rango 1..MaxPageSize.</summary>
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value < 1 ? DefaultPageSize : Math.Min(value, MaxPageSize);
    }

    /// <summary>Cantidad de registros a omitir para la página actual.</summary>
    public int Skip => (Page - 1) * PageSize;
}
