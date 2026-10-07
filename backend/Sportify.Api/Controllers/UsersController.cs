using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Sportify.Application.DTOs.Users;
using Sportify.Application.Interfaces;

namespace Sportify.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>Lista todos los usuarios del sistema.</summary>
    [HttpGet]
    [Authorize(Roles = "ADMIN,CONTADOR")]
    [ProducesResponseType(typeof(IEnumerable<UserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userService.GetAllAsync();
        return Ok(users);
    }

    /// <summary>Obtiene un usuario por ID.</summary>
    [HttpGet("{id:int}")]
    [Authorize(Roles = "ADMIN")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user is null) return NotFound(new { message = $"Usuario con ID {id} no encontrado." });
        return Ok(user);
    }

    /// <summary>Crea un nuevo usuario.</summary>
    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
    {
        var user = await _userService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
    }

    /// <summary>Actualiza los datos de un usuario.</summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "ADMIN")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDto dto)
    {
        var user = await _userService.UpdateAsync(id, dto);
        return Ok(user);
    }

    /// <summary>Elimina un usuario del sistema (Hard Delete).</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "ADMIN")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        await _userService.DeleteAsync(id);
        return NoContent();
    }

    /// <summary>Activa o desactiva un usuario (borrado logico).</summary>
    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = "ADMIN")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetStatus(int id, [FromBody] bool activo)
    {
        await _userService.SetStatusAsync(id, activo);
        return NoContent();
    }

    /// <summary>Resetea la contraseÃ±a de un usuario por defecto y apaga la alarma.</summary>
    [HttpPost("{id:int}/reset-password")]
    [Authorize(Roles = "ADMIN")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ResetPassword(int id)
    {
        await _userService.ResetPasswordAsync(id, "Sportify2026!");
        return NoContent();
    }
}

