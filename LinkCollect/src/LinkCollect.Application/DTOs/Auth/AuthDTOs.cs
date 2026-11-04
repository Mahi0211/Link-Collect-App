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

    public string? Username { get; set; }

    [Required(ErrorMessage = "Full Name is required.")]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters long.")]
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
    public string? RoleTitle { get; set; }
    public string? Location { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string? CoverUrl { get; set; }
    public string? SocialLinksJson { get; set; }
    public int TotalCollections { get; set; }
    public int TotalLinks { get; set; }
}

public class UpdateUserProfileDto
{
    [Required(ErrorMessage = "Name is required.")]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Username { get; set; }

    [MaxLength(150)]
    public string? RoleTitle { get; set; }

    [MaxLength(150)]
    public string? Location { get; set; }

    [MaxLength(500)]
    public string? Bio { get; set; }

    public string? AvatarUrl { get; set; }

    public string? CoverUrl { get; set; }

    public string? SocialLinksJson { get; set; }
}
