using Microsoft.EntityFrameworkCore;
using LinkCollect.Application.Common.Exceptions;
using LinkCollect.Application.Common.Interfaces;
using LinkCollect.Application.DTOs.Auth;
using LinkCollect.Domain.Entities;

namespace LinkCollect.Application.Services;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public AuthService(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        ITokenService tokenService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            throw new BadRequestException("Email is required.");
        }

        var emailLower = request.Email.Trim().ToLowerInvariant();

        var emailExists = await _context.Users
            .AnyAsync(u => u.Email.ToLower() == emailLower, cancellationToken);

        if (emailExists)
        {
            throw new BadRequestException("An account with this email address already exists.");
        }

        // Server-side password complexity verification
        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
        {
            throw new BadRequestException("Password must be at least 8 characters long.");
        }

        bool hasLetter = request.Password.Any(char.IsLetter);
        bool hasDigit = request.Password.Any(char.IsDigit);
        bool hasSpecial = request.Password.Any(ch => !char.IsLetterOrDigit(ch));

        if (!hasLetter || (!hasDigit && !hasSpecial))
        {
            throw new BadRequestException("Password must contain letters and at least one number or special character.");
        }

        // Derive or validate unique username
        string resolvedUsername;
        if (!string.IsNullOrWhiteSpace(request.Username))
        {
            resolvedUsername = request.Username.Trim();
            var usernameLower = resolvedUsername.ToLowerInvariant();
            var usernameExists = await _context.Users
                .AnyAsync(u => u.Username.ToLower() == usernameLower, cancellationToken);

            if (usernameExists)
            {
                throw new BadRequestException("This username is already taken. Please choose another one.");
            }
        }
        else
        {
            var baseName = !string.IsNullOrWhiteSpace(request.Name)
                ? request.Name.Trim()
                : emailLower.Split('@')[0];

            var sanitized = new string(baseName.Where(c => char.IsLetterOrDigit(c) || c == '_').ToArray()).ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(sanitized))
            {
                sanitized = "user";
            }

            resolvedUsername = sanitized;
            int attempt = 0;
            var rnd = new Random();
            while (await _context.Users.AnyAsync(u => u.Username.ToLower() == resolvedUsername.ToLower(), cancellationToken))
            {
                attempt++;
                resolvedUsername = $"{sanitized}_{rnd.Next(1000, 9999)}";
                if (attempt > 10)
                {
                    resolvedUsername = $"{sanitized}_{Guid.NewGuid().ToString("N")[..6]}";
                    break;
                }
            }
        }

        var resolvedName = !string.IsNullOrWhiteSpace(request.Name) ? request.Name.Trim() : resolvedUsername;

        var user = new User
        {
            Email = emailLower,
            Username = resolvedUsername,
            Name = resolvedName,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        var token = _tokenService.GenerateJwtToken(user);

        return new AuthResponseDto
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Username = user.Username,
                Name = user.Name,
                RoleTitle = user.RoleTitle,
                Location = user.Location,
                Bio = user.Bio,
                AvatarUrl = user.AvatarUrl,
                CoverUrl = user.CoverUrl,
                SocialLinksJson = user.SocialLinksJson,
                TotalCollections = 0,
                TotalLinks = 0
            }
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        var identifier = request.Identifier.Trim().ToLowerInvariant();
        var identifierNoSpace = identifier.Replace(" ", "");

        var user = await _context.Users
            .FirstOrDefaultAsync(u => 
                u.Email.ToLower() == identifier || 
                u.Username.ToLower() == identifier || 
                u.Username.Replace(" ", "").ToLower() == identifierNoSpace, 
                cancellationToken);

        // If the user does not exist yet in cloud DB (e.g. Aiven was powered off during startup seed),
        // automatically provision Lionel Mahi dynamically on valid credentials
        if (user == null && (identifier == "lionelmahi9@gmail.com" || identifierNoSpace == "lionelmahi") && request.Password == "Mahin@99")
        {
            user = new User
            {
                Email = "lionelmahi9@gmail.com",
                Username = "Lionel Mahi",
                Name = "Lionel Mahi",
                PasswordHash = _passwordHasher.HashPassword("Mahin@99"),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync(cancellationToken);
        }

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedException("Invalid email/username or password.");
        }

        var token = _tokenService.GenerateJwtToken(user);

        return new AuthResponseDto
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Username = user.Username,
                Name = user.Name,
                RoleTitle = user.RoleTitle,
                Location = user.Location,
                Bio = user.Bio,
                AvatarUrl = user.AvatarUrl,
                CoverUrl = user.CoverUrl,
                SocialLinksJson = user.SocialLinksJson,
                TotalCollections = 0,
                TotalLinks = 0
            }
        };
    }

    public async Task<UserDto> GetCurrentUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException("User not found.");
        }

        var totalCollections = await _context.Collections.CountAsync(c => c.UserId == userId, cancellationToken);
        var totalLinks = await _context.Links.CountAsync(l => l.UserId == userId, cancellationToken);

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Username = user.Username,
            Name = user.Name,
            RoleTitle = user.RoleTitle,
            Location = user.Location,
            Bio = user.Bio,
            AvatarUrl = user.AvatarUrl,
            CoverUrl = user.CoverUrl,
            SocialLinksJson = user.SocialLinksJson,
            TotalCollections = totalCollections,
            TotalLinks = totalLinks
        };
    }

    public async Task<UserDto> UpdateUserProfileAsync(int userId, UpdateUserProfileDto request, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user == null)
        {
            throw new NotFoundException("User not found.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new BadRequestException("Full Name cannot be empty.");
        }

        // If username is being changed, check uniqueness against other users
        if (!string.IsNullOrWhiteSpace(request.Username))
        {
            var trimmedUsername = request.Username.Trim();
            if (!string.Equals(trimmedUsername, user.Username, StringComparison.OrdinalIgnoreCase))
            {
                var usernameLower = trimmedUsername.ToLowerInvariant();
                var isTaken = await _context.Users
                    .AnyAsync(u => u.Id != userId && u.Username.ToLower() == usernameLower, cancellationToken);

                if (isTaken)
                {
                    throw new BadRequestException($"Username '@{trimmedUsername}' is already taken. Please choose another.");
                }
                user.Username = trimmedUsername;
            }
        }

        user.Name = request.Name.Trim();
        user.RoleTitle = request.RoleTitle?.Trim();
        user.Location = request.Location?.Trim();
        user.Bio = request.Bio?.Trim();
        user.AvatarUrl = request.AvatarUrl?.Trim();
        user.CoverUrl = request.CoverUrl?.Trim();
        user.SocialLinksJson = request.SocialLinksJson?.Trim();
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        var totalCollections = await _context.Collections.CountAsync(c => c.UserId == userId, cancellationToken);
        var totalLinks = await _context.Links.CountAsync(l => l.UserId == userId, cancellationToken);

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Username = user.Username,
            Name = user.Name,
            RoleTitle = user.RoleTitle,
            Location = user.Location,
            Bio = user.Bio,
            AvatarUrl = user.AvatarUrl,
            CoverUrl = user.CoverUrl,
            SocialLinksJson = user.SocialLinksJson,
            TotalCollections = totalCollections,
            TotalLinks = totalLinks
        };
    }

    public async Task<bool> CheckUsernameAvailabilityAsync(string username, int? currentUserId = null, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(username)) return false;
        var lower = username.Trim().ToLowerInvariant();
        var exists = await _context.Users
            .AnyAsync(u => (!currentUserId.HasValue || u.Id != currentUserId.Value) && u.Username.ToLower() == lower, cancellationToken);
        return !exists;
    }
}
