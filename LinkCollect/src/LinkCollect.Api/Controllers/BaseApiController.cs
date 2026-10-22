using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace LinkCollect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected int GetUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(idClaim, out var userId))
        {
            return userId;
        }

        throw new UnauthorizedAccessException("User is not authenticated or invalid token.");
    }
}
