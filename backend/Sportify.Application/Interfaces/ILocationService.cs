namespace Sportify.Application.Interfaces;

using Sportify.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface ILocationService
{
    Task<IEnumerable<LocationDto>> GetAllAsync();
    Task<Sede> CreateAsync(Sede sede);
    Task<Sede?> UpdateAsync(int id, Sede sede);
    Task<bool> DeleteAsync(int id);
}
