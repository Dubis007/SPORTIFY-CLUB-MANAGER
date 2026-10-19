namespace Sportify.Application.Services;

using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

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

    public async Task<Sede> CreateAsync(Sede sede)
    {
        sede.CreadoEn = DateTime.UtcNow;
        return await _repository.AddAsync(sede);
    }

    public async Task<Sede?> UpdateAsync(int id, Sede dto)
    {
        var sede = await _repository.GetByIdAsync(id);
        if (sede == null) return null;

        sede.Nombre = dto.Nombre;
        sede.Direccion = dto.Direccion;
        sede.Ciudad = dto.Ciudad;
        sede.Telefono = dto.Telefono;
        sede.Activo = dto.Activo;

        await _repository.UpdateAsync(sede);
        return sede;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var sede = await _repository.GetByIdAsync(id);
        if (sede == null) return false;

        sede.Activo = false;
        await _repository.UpdateAsync(sede);
        return true;
    }
}
