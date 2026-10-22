using LinkCollect.Application.DTOs.Auth;

namespace LinkCollect.Application.Common.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default);
    Task<UserDto> GetCurrentUserAsync(int userId, CancellationToken cancellationToken = default);
}
