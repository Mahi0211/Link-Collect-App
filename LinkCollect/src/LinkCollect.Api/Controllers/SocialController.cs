using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LinkCollect.Application.Common.Interfaces;
using LinkCollect.Application.DTOs.Friends;

namespace LinkCollect.Api.Controllers;

[Authorize]
public class SocialController : BaseApiController
{
    private readonly ISocialService _socialService;

    public SocialController(ISocialService socialService)
    {
        _socialService = socialService;
    }

    [HttpGet("friends/{friendId:int}/collections")]
    public async Task<ActionResult<List<SharedCollectionDto>>> GetFriendPublicCollections(int friendId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var collections = await _socialService.GetFriendPublicCollectionsAsync(userId, friendId, cancellationToken);
        return Ok(collections);
    }

    [HttpGet("collections/{collectionId:int}")]
    public async Task<ActionResult<SharedCollectionDto>> GetPublicCollectionDetails(int collectionId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var collection = await _socialService.GetPublicCollectionDetailsAsync(userId, collectionId, cancellationToken);
        return Ok(collection);
    }

    [HttpGet("collections/{collectionId:int}/links")]
    public async Task<ActionResult<List<SharedLinkDto>>> GetPublicCollectionLinks(int collectionId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var links = await _socialService.GetPublicCollectionLinksAsync(userId, collectionId, cancellationToken);
        return Ok(links);
    }

    [HttpPost("collections/{collectionId:int}/rate")]
    public async Task<ActionResult<CollectionRatingDto>> RateCollection(int collectionId, [FromBody] RateCollectionDto request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var rating = await _socialService.RateCollectionAsync(userId, collectionId, request, cancellationToken);
        return Ok(rating);
    }

    [HttpGet("collections/{collectionId:int}/ratings")]
    public async Task<ActionResult<List<CollectionRatingDto>>> GetCollectionRatings(int collectionId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var ratings = await _socialService.GetCollectionRatingsAsync(userId, collectionId, cancellationToken);
        return Ok(ratings);
    }

    [HttpGet("feed")]
    public async Task<ActionResult<List<SharedLinkDto>>> GetFriendsFeed([FromQuery] int limit = 30, CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();
        var feed = await _socialService.GetFriendsFeedAsync(userId, limit, cancellationToken);
        return Ok(feed);
    }
}
