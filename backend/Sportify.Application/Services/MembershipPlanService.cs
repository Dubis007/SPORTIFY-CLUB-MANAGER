namespace Sportify.Application.Services;

using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

public class MembershipPlanService : IMembershipPlanService
{
    private readonly IMembershipPlanRepository _repository;

    public MembershipPlanService(IMembershipPlanRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<PlanMembresia>> GetAllAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<PlanMembresia> CreateAsync(PlanMembresia plan)
    {
        plan.CreadoEn = DateTime.UtcNow;
        return await _repository.AddAsync(plan);
    }

    public async Task<PlanMembresia?> UpdateAsync(int id, PlanMembresia dto)
    {
        var plan = await _repository.GetByIdAsync(id);
        if (plan == null) return null;

        plan.Nombre = dto.Nombre;
        plan.Descripcion = dto.Descripcion;
        plan.PrecioCOP = dto.PrecioCOP;
        plan.DuracionDias = dto.DuracionDias;
        plan.Activo = dto.Activo;

        await _repository.UpdateAsync(plan);
        return plan;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var plan = await _repository.GetByIdAsync(id);
        if (plan == null) return false;

        plan.Activo = false;
        await _repository.UpdateAsync(plan);
        return true;
    }
}
