using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LinkCollect.Application.Common.Interfaces;
using LinkCollect.Application.DTOs.Friends;

namespace LinkCollect.Api.Controllers;

[Authorize]
public class FriendsController : BaseApiController
{
    private readonly IFriendService _friendService;

    public FriendsController(IFriendService friendService)
    {
        _friendService = friendService;
    }

    [HttpGet]
    public async Task<ActionResult<List<FriendDto>>> GetFriends(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var friends = await _friendService.GetFriendsAsync(userId, cancellationToken);
        return Ok(friends);
    }

    [HttpGet("requests")]
    public async Task<ActionResult<List<FriendRequestDto>>> GetPendingRequests(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var requests = await _friendService.GetPendingRequestsAsync(userId, cancellationToken);
        return Ok(requests);
    }

    [HttpPost("requests")]
    public async Task<ActionResult<FriendRequestDto>> SendFriendRequest([FromBody] SendFriendRequestDto request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await _friendService.SendFriendRequestAsync(userId, request, cancellationToken);
        return Ok(result);
    }

    [HttpPut("requests/{id:int}/accept")]
    public async Task<IActionResult> AcceptFriendRequest(int id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        await _friendService.AcceptFriendRequestAsync(userId, id, cancellationToken);
        return NoContent();
    }

    [HttpPut("requests/{id:int}/reject")]
    public async Task<IActionResult> RejectFriendRequest(int id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        await _friendService.RejectFriendRequestAsync(userId, id, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{friendUserId:int}")]
    public async Task<IActionResult> RemoveFriend(int friendUserId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        await _friendService.RemoveFriendAsync(userId, friendUserId, cancellationToken);
        return NoContent();
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<UserSearchDto>>> SearchUsers([FromQuery] string q, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var results = await _friendService.SearchUsersAsync(userId, q, cancellationToken);
        return Ok(results);
    }
}

