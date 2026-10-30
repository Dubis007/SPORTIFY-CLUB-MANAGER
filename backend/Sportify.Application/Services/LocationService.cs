using Sportify.Application.DTOs.Locations;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;

namespace Sportify.Application.Services;

public class LocationService : ILocationService
{
    private readonly ILocationRepository _repository;

    public LocationService(ILocationRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<LocationDto>> GetAllAsync()
    {
        return await _repository.GetAllWithStatsAsync();
    }

    public async Task<LocationDto> CreateAsync(SaveLocationDto dto)
    {
        var sede = new Sede
        {
            Nombre = dto.Nombre,
            Direccion = dto.Direccion,
            Ciudad = dto.Ciudad,
            Telefono = dto.Telefono,
            Activo = dto.Activo,
            CreadoEn = DateTime.UtcNow
        };

        var saved = await _repository.AddAsync(sede);
        return MapToDto(saved);
    }

    public async Task<LocationDto?> UpdateAsync(int id, SaveLocationDto dto)
    {
        var sede = await _repository.GetByIdAsync(id);
        if (sede == null) return null;

        sede.Nombre = dto.Nombre;
        sede.Direccion = dto.Direccion;
        sede.Ciudad = dto.Ciudad;
        sede.Telefono = dto.Telefono;
        sede.Activo = dto.Activo;

        await _repository.UpdateAsync(sede);
        return MapToDto(sede);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var sede = await _repository.GetByIdAsync(id);
        if (sede == null) return false;

        sede.Activo = false;
        await _repository.UpdateAsync(sede);
        return true;
    }

    private static LocationDto MapToDto(Sede s) => new()
    {
        Id = s.Id,
        Nombre = s.Nombre,
        Direccion = s.Direccion,
        Ciudad = s.Ciudad,
        Telefono = s.Telefono,
        Activo = s.Activo,
        CreadoEn = s.CreadoEn
    };
}
