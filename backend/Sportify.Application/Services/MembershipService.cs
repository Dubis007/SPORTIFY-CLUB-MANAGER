using Sportify.Application.DTOs.Memberships;
using Sportify.Application.Interfaces;
using Sportify.Domain.Entities;
using Sportify.Domain.Enums;

namespace Sportify.Application.Services;

public class MembershipService : IMembershipService
{
    private readonly IMembershipRepository _repository;

    public MembershipService(IMembershipRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<PlanMembresiaDto>> GetPlansAsync()
    {
        var planes = await _repository.GetActivePlansAsync();

        return planes.Select(p => new PlanMembresiaDto
        {
            Id = p.Id,
            Nombre = p.Nombre,
            Descripcion = p.Descripcion,
            PrecioCOP = p.PrecioCOP,
            DuracionDias = p.DuracionDias,
            Activo = p.Activo
        });
    }

    public async Task<IEnumerable<MembershipDto>> GetAllMembershipsAsync()
    {
        var membresias = await _repository.GetAllWithDetailsAsync();
        return membresias.Select(MapToDto);
    }

    public async Task<IEnumerable<MembershipDto>> GetMembershipsByUserAsync(int userId)
    {
        var membresias = await _repository.GetByUserIdWithDetailsAsync(userId);
        return membresias.Select(MapToDto);
    }

    public async Task<MembershipDto> CreateMembershipAsync(CreateMembershipDto dto)
    {
        var userExists = await _repository.UserExistsAsync(dto.UsuarioId);
        if (!userExists)
            throw new KeyNotFoundException("Usuario no encontrado.");

        // Regla de Negocio: Un usuario no puede tener más de una membresía activa o pendiente.
        var hasActiveMembership = await _repository.HasActiveOrPendingMembershipAsync(dto.UsuarioId);
        if (hasActiveMembership)
        {
            throw new InvalidOperationException(
                "El usuario ya tiene una membresía Activa o Pendiente. No puede tener dos membresías al mismo tiempo.");
        }

        var plan = await _repository.GetPlanByIdAsync(dto.PlanMembresiaId);
        if (plan == null)
            throw new KeyNotFoundException("Plan de membresía no encontrado.");

        var membresia = new Membresia
        {
            UsuarioId = dto.UsuarioId,
            PlanMembresiaId = dto.PlanMembresiaId,
            FechaInicio = dto.FechaInicio,
            FechaFin = dto.FechaInicio.AddDays(plan.DuracionDias),
            Estado = EstadoMembresia.ACTIVA,
            CreadoEn = DateTime.UtcNow,
            ActualizadoEn = DateTime.UtcNow
        };

        var saved = await _repository.AddAsync(membresia);
        return MapToDto(saved);
    }

    public async Task<MembershipDto> UpdateMembershipStatusAsync(int id, UpdateMembershipStatusDto dto)
    {
        var membresia = await _repository.GetByIdWithDetailsAsync(id);
        if (membresia == null)
            throw new KeyNotFoundException("Membresía no encontrada.");

        membresia.Estado = dto.Estado;
        membresia.ActualizadoEn = DateTime.UtcNow;

        await _repository.UpdateAsync(membresia);
        return MapToDto(membresia);
    }

    private static MembershipDto MapToDto(Membresia m)
    {
        return new MembershipDto
        {
            Id = m.Id,
            UsuarioId = m.UsuarioId,
            UsuarioNombre = $"{m.Usuario?.Nombre} {m.Usuario?.Apellido}".Trim(),
            PlanMembresiaId = m.PlanMembresiaId,
            PlanNombre = m.PlanMembresia?.Nombre ?? string.Empty,
            FechaInicio = m.FechaInicio,
            FechaFin = m.FechaFin,
            Estado = m.Estado.ToString(),
            CreadoEn = m.CreadoEn
        };
    }
}
