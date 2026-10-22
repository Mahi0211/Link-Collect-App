using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LinkCollect.Application.Common.Interfaces;
using LinkCollect.Application.DTOs.Collections;

namespace LinkCollect.Api.Controllers;

[Authorize]
public class CollectionsController : BaseApiController
{
    private readonly ICollectionService _collectionService;

    public CollectionsController(ICollectionService collectionService)
    {
        _collectionService = collectionService;
    }

    [HttpGet]
    public async Task<ActionResult<List<CollectionDto>>> GetCollections(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var collections = await _collectionService.GetUserCollectionsAsync(userId, cancellationToken);
        return Ok(collections);
    }

    [HttpPost]
    public async Task<ActionResult<CollectionDto>> CreateCollection([FromBody] CreateCollectionDto request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var collection = await _collectionService.CreateCollectionAsync(userId, request, cancellationToken);
        return CreatedAtAction(nameof(GetCollections), new { id = collection.Id }, collection);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CollectionDto>> UpdateCollection(int id, [FromBody] UpdateCollectionDto request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var collection = await _collectionService.UpdateCollectionAsync(userId, id, request, cancellationToken);
        return Ok(collection);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCollection(int id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        await _collectionService.DeleteCollectionAsync(userId, id, cancellationToken);
        return NoContent();
    }
}
