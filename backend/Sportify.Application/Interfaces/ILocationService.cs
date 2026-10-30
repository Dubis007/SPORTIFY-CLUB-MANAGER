using Sportify.Application.DTOs.Locations;

namespace Sportify.Application.Interfaces;

public interface ILocationService
{
    Task<IEnumerable<LocationDto>> GetAllAsync();
    Task<LocationDto> CreateAsync(SaveLocationDto dto);
    Task<LocationDto?> UpdateAsync(int id, SaveLocationDto dto);
    Task<bool> DeleteAsync(int id);
}
