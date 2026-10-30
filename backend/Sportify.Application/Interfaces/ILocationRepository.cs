using Sportify.Application.DTOs.Locations;
using Sportify.Domain.Entities;

namespace Sportify.Application.Interfaces;

public interface ILocationRepository
{
    Task<IEnumerable<LocationDto>> GetAllWithStatsAsync();
    Task<Sede?> GetByIdAsync(int id);
    Task<Sede> AddAsync(Sede sede);
    Task UpdateAsync(Sede sede);
}
