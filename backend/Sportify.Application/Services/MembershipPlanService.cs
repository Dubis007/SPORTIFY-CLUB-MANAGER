using Sportify.Application.DTOs.MembershipPlans;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;

namespace Sportify.Application.Services;

public class MembershipPlanService : IMembershipPlanService
{
    private readonly IMembershipPlanRepository _repository;

    public MembershipPlanService(IMembershipPlanRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<MembershipPlanDto>> GetAllAsync()
    {
        var plans = await _repository.GetAllAsync();
        return plans.Select(MapToDto);
    }

    public async Task<MembershipPlanDto> CreateAsync(SaveMembershipPlanDto dto)
    {
        var plan = new PlanMembresia
        {
            Nombre = dto.Nombre,
            Descripcion = dto.Descripcion,
            PrecioCOP = dto.PrecioCOP,
            DuracionDias = dto.DuracionDias,
            Activo = dto.Activo,
            CreadoEn = DateTime.UtcNow
        };

        var saved = await _repository.AddAsync(plan);
        return MapToDto(saved);
    }

    public async Task<MembershipPlanDto?> UpdateAsync(int id, SaveMembershipPlanDto dto)
    {
        var plan = await _repository.GetByIdAsync(id);
        if (plan == null) return null;

        plan.Nombre = dto.Nombre;
        plan.Descripcion = dto.Descripcion;
        plan.PrecioCOP = dto.PrecioCOP;
        plan.DuracionDias = dto.DuracionDias;
        plan.Activo = dto.Activo;

        await _repository.UpdateAsync(plan);
        return MapToDto(plan);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var plan = await _repository.GetByIdAsync(id);
        if (plan == null) return false;

        plan.Activo = false;
        await _repository.UpdateAsync(plan);
        return true;
    }

    private static MembershipPlanDto MapToDto(PlanMembresia p) => new()
    {
        Id = p.Id,
        Nombre = p.Nombre,
        Descripcion = p.Descripcion,
        PrecioCOP = p.PrecioCOP,
        DuracionDias = p.DuracionDias,
        Activo = p.Activo,
        CreadoEn = p.CreadoEn
    };
}
