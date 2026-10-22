using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LinkCollect.Application.Common.Interfaces;
using LinkCollect.Application.DTOs.Links;

namespace LinkCollect.Api.Controllers;

[Authorize]
public class LinksController : BaseApiController
{
    private readonly ILinkService _linkService;

    public LinksController(ILinkService linkService)
    {
        _linkService = linkService;
    }

    [HttpGet]
    public async Task<ActionResult<List<LinkDto>>> GetLinks(
        [FromQuery] int? collectionId,
        [FromQuery] string? view,
        [FromQuery] string? tag,
        [FromQuery] string? search,
        [FromQuery] string? sort,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var links = await _linkService.GetUserLinksAsync(userId, collectionId, view, tag, search, sort, cancellationToken);
        return Ok(links);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<LinkDto>> GetLinkById(int id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var link = await _linkService.GetLinkByIdAsync(userId, id, cancellationToken);
        return Ok(link);
    }

    [HttpPost]
    public async Task<ActionResult<LinkDto>> CreateLink([FromBody] CreateLinkDto request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var link = await _linkService.CreateLinkAsync(userId, request, cancellationToken);
        return CreatedAtAction(nameof(GetLinkById), new { id = link.Id }, link);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<LinkDto>> UpdateLink(int id, [FromBody] UpdateLinkDto request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var link = await _linkService.UpdateLinkAsync(userId, id, request, cancellationToken);
        return Ok(link);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteLink(int id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        await _linkService.DeleteLinkAsync(userId, id, cancellationToken);
        return NoContent();
    }

    [HttpPatch("{id:int}/favorite")]
    public async Task<ActionResult<LinkDto>> ToggleFavorite(int id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var link = await _linkService.ToggleFavoriteAsync(userId, id, cancellationToken);
        return Ok(link);
    }

    [HttpPatch("{id:int}/read-later")]
    public async Task<ActionResult<LinkDto>> ToggleReadLater(int id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var link = await _linkService.ToggleReadLaterAsync(userId, id, cancellationToken);
        return Ok(link);
    }

    [HttpPatch("{id:int}/archive")]
    public async Task<ActionResult<LinkDto>> ToggleArchive(int id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var link = await _linkService.ToggleArchiveAsync(userId, id, cancellationToken);
        return Ok(link);
    }

    [HttpPatch("{id:int}/watched")]
    public async Task<ActionResult<LinkDto>> ToggleWatched(int id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var link = await _linkService.ToggleWatchedAsync(userId, id, cancellationToken);
        return Ok(link);
    }

    [HttpPatch("{id:int}/rate")]
    public async Task<ActionResult<LinkDto>> RateLink(int id, [FromBody] RateLinkDto request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var link = await _linkService.RateLinkAsync(userId, id, request.Rating, cancellationToken);
        return Ok(link);
    }

    [HttpPost("seed")]
    public async Task<ActionResult<object>> SeedUserData([FromBody] SeedUserImportDto seedData, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var count = await _linkService.SeedUserDataAsync(userId, seedData, cancellationToken);
        return Ok(new { message = $"Successfully imported {count} links.", count });
    }
}
