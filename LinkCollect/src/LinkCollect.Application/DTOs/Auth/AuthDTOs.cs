using System.ComponentModel.DataAnnotations;

namespace LinkCollect.Application.DTOs.Auth;

public class LoginRequestDto
{
    [Required]
    public string Identifier { get; set; } = string.Empty; // Email or Username

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(3)]
    public string Username { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
}

public class UserDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}
