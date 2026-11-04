using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using LinkCollect.Application.Common.Interfaces;
using LinkCollect.Application.DTOs.Auth;

namespace LinkCollect.Api.Controllers;

[EnableRateLimiting("AuthRateLimit")]
public class AuthController : BaseApiController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto request, CancellationToken cancellationToken)
    {
        var result = await _authService.RegisterAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto request, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpGet("me")]
    [HttpGet("profile")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetMe(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var user = await _authService.GetCurrentUserAsync(userId, cancellationToken);
        return Ok(user);
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<ActionResult<UserDto>> UpdateProfile([FromBody] UpdateUserProfileDto request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var updated = await _authService.UpdateUserProfileAsync(userId, request, cancellationToken);
        return Ok(updated);
    }

    [HttpGet("check-username")]
    [AllowAnonymous]
    public async Task<ActionResult> CheckUsername([FromQuery] string username, CancellationToken cancellationToken)
    {
        var userId = TryGetUserId();
        var isAvailable = await _authService.CheckUsernameAvailabilityAsync(username, userId, cancellationToken);
        return Ok(new { available = isAvailable, username });
    }
}
