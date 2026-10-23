using Microsoft.EntityFrameworkCore;
using LinkCollect.Application.Common.Exceptions;
using LinkCollect.Application.Common.Interfaces;
using LinkCollect.Application.DTOs.Links;
using LinkCollect.Domain.Entities;

namespace LinkCollect.Application.Services;

public class LinkService : ILinkService
{
    private readonly IApplicationDbContext _context;

    public LinkService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<LinkDto>> GetUserLinksAsync(
        int userId,
        int? collectionId = null,
        string? view = null,
        string? tag = null,
        string? search = null,
        string? sort = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Links
            .Include(l => l.Collection)
            .Include(l => l.LinkTags)
                .ThenInclude(lt => lt.Tag)
            .Where(l => l.UserId == userId);

        // Filter by collection
        if (collectionId.HasValue && collectionId.Value > 0)
        {
            query = query.Where(l => l.CollectionId == collectionId.Value);
        }

        // Filter by view
        if (!string.IsNullOrWhiteSpace(view))
        {
            switch (view.ToLowerInvariant())
            {
                case "favorites":
                    query = query.Where(l => l.IsFavorite && !l.IsArchived);
                    break;
                case "readlater":
                    query = query.Where(l => l.IsReadLater && !l.IsArchived);
                    break;
                case "archive":
                    query = query.Where(l => l.IsArchived);
                    break;
                case "toprated":
                    query = query.Where(l => l.Rating >= 4 && !l.IsArchived);
                    break;
                case "rewatch":
                case "rewatchworthy":
                    query = query.Where(l => l.RewatchWorthy && !l.IsArchived);
                    break;
                case "watched":
                    query = query.Where(l => l.Watched && !l.IsArchived);
                    break;
                case "all":
                default:
                    // In default "all" view, do not display archived items
                    query = query.Where(l => !l.IsArchived);
                    break;
            }
        }
        else
        {
            query = query.Where(l => !l.IsArchived);
        }

        // Filter by tag
        if (!string.IsNullOrWhiteSpace(tag))
        {
            var tagLower = tag.Trim().ToLower();
            query = query.Where(l => l.LinkTags.Any(lt => lt.Tag != null && lt.Tag.Name.ToLower() == tagLower));
        }

        // Search query
        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(l =>
                l.Title.ToLower().Contains(searchLower) ||
                l.Url.ToLower().Contains(searchLower) ||
                l.Domain.ToLower().Contains(searchLower) ||
                l.Notes.ToLower().Contains(searchLower) ||
                l.LinkTags.Any(lt => lt.Tag != null && lt.Tag.Name.ToLower().Contains(searchLower))
            );
        }

        // Sorting
        query = (sort?.ToLowerInvariant()) switch
        {
            "oldest" => query.OrderBy(l => l.CreatedAt).ThenBy(l => l.Id),
            "alphabetical" => query.OrderBy(l => l.Title).ThenByDescending(l => l.Id),
            "domain" => query.OrderBy(l => l.Domain).ThenByDescending(l => l.Id),
            _ => query.OrderByDescending(l => l.CreatedAt).ThenByDescending(l => l.Id)
        };

        var items = await query.ToListAsync(cancellationToken);

        return items.Select(MapToDto).ToList();
    }

    public async Task<LinkDto> GetLinkByIdAsync(int userId, int linkId, CancellationToken cancellationToken = default)
    {
        var item = await _context.Links
            .Include(l => l.Collection)
            .Include(l => l.LinkTags)
                .ThenInclude(lt => lt.Tag)
            .FirstOrDefaultAsync(l => l.Id == linkId && l.UserId == userId, cancellationToken);

        if (item == null)
        {
            throw new NotFoundException("Link not found.");
        }

        return MapToDto(item);
    }

    public async Task<LinkDto> CreateLinkAsync(int userId, CreateLinkDto request, CancellationToken cancellationToken = default)
    {
        var url = request.Url.Trim();
        var domain = ExtractDomain(url);
        var title = !string.IsNullOrWhiteSpace(request.Title) ? request.Title.Trim() : GetFallbackTitle(url, domain);

        int? collectionId = request.CollectionId;
        if (!collectionId.HasValue && !string.IsNullOrWhiteSpace(request.CollectionName))
        {
            var colName = request.CollectionName.Trim();
            var col = await _context.Collections
                .FirstOrDefaultAsync(c => c.UserId == userId && c.Name.ToLower() == colName.ToLower(), cancellationToken);

            if (col == null)
            {
                col = new Collection
                {
                    UserId = userId,
                    Name = colName,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Collections.Add(col);
                await _context.SaveChangesAsync(cancellationToken);
            }
            collectionId = col.Id;
        }

        var linkItem = new LinkItem
        {
            UserId = userId,
            CollectionId = collectionId,
            Url = url,
            Title = title,
            Domain = domain,
            Notes = request.Notes?.Trim() ?? string.Empty,
            IsFavorite = request.IsFavorite,
            IsReadLater = request.IsReadLater,
            IsArchived = request.IsArchived,
            Rating = request.Rating,
            Review = request.Review?.Trim() ?? string.Empty,
            Watched = request.Watched,
            WatchCount = request.WatchCount,
            RewatchWorthy = request.RewatchWorthy || request.Rating >= 4,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Links.Add(linkItem);
        await _context.SaveChangesAsync(cancellationToken);

        // Handle tags
        if (request.CustomTags != null && request.CustomTags.Count > 0)
        {
            await AttachTagsAsync(userId, linkItem, request.CustomTags, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        // Reload with navigation properties
        return await GetLinkByIdAsync(userId, linkItem.Id, cancellationToken);
    }

    public async Task<LinkDto> UpdateLinkAsync(int userId, int linkId, UpdateLinkDto request, CancellationToken cancellationToken = default)
    {
        var linkItem = await _context.Links
            .Include(l => l.Collection)
            .Include(l => l.LinkTags)
                .ThenInclude(lt => lt.Tag)
            .FirstOrDefaultAsync(l => l.Id == linkId && l.UserId == userId, cancellationToken);

        if (linkItem == null)
        {
            throw new NotFoundException("Link not found.");
        }

        if (request.Url != null)
        {
            linkItem.Url = request.Url.Trim();
            linkItem.Domain = ExtractDomain(linkItem.Url);
        }

        if (request.Title != null)
        {
            linkItem.Title = request.Title.Trim();
        }

        if (request.Notes != null)
        {
            linkItem.Notes = request.Notes.Trim();
        }

        if (request.CollectionId.HasValue)
        {
            linkItem.CollectionId = request.CollectionId.Value;
        }
        else if (!string.IsNullOrWhiteSpace(request.CollectionName))
        {
            var colName = request.CollectionName.Trim();
            var col = await _context.Collections
                .FirstOrDefaultAsync(c => c.UserId == userId && c.Name.ToLower() == colName.ToLower(), cancellationToken);

            if (col == null)
            {
                col = new Collection
                {
                    UserId = userId,
                    Name = colName,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Collections.Add(col);
                await _context.SaveChangesAsync(cancellationToken);
            }
            linkItem.CollectionId = col.Id;
        }

        if (request.IsFavorite.HasValue) linkItem.IsFavorite = request.IsFavorite.Value;
        if (request.IsReadLater.HasValue) linkItem.IsReadLater = request.IsReadLater.Value;
        if (request.IsArchived.HasValue) linkItem.IsArchived = request.IsArchived.Value;

        if (request.Rating.HasValue)
        {
            linkItem.Rating = request.Rating.Value;
            if (linkItem.Rating >= 4)
            {
                linkItem.RewatchWorthy = true;
            }
        }

        if (request.Review != null) linkItem.Review = request.Review.Trim();
        if (request.Watched.HasValue) linkItem.Watched = request.Watched.Value;
        if (request.WatchCount.HasValue) linkItem.WatchCount = request.WatchCount.Value;
        if (request.RewatchWorthy.HasValue) linkItem.RewatchWorthy = request.RewatchWorthy.Value;

        linkItem.UpdatedAt = DateTime.UtcNow;

        if (request.CustomTags != null)
        {
            _context.LinkTags.RemoveRange(linkItem.LinkTags);
            await AttachTagsAsync(userId, linkItem, request.CustomTags, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return await GetLinkByIdAsync(userId, linkItem.Id, cancellationToken);
    }

    public async Task DeleteLinkAsync(int userId, int linkId, CancellationToken cancellationToken = default)
    {
        var linkItem = await _context.Links
            .Include(l => l.LinkTags)
            .FirstOrDefaultAsync(l => l.Id == linkId && l.UserId == userId, cancellationToken);

        if (linkItem == null)
        {
            throw new NotFoundException("Link not found.");
        }

        _context.LinkTags.RemoveRange(linkItem.LinkTags);
        _context.Links.Remove(linkItem);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<LinkDto> ToggleFavoriteAsync(int userId, int linkId, CancellationToken cancellationToken = default)
    {
        var link = await _context.Links.FirstOrDefaultAsync(l => l.Id == linkId && l.UserId == userId, cancellationToken);
        if (link == null) throw new NotFoundException("Link not found.");

        link.IsFavorite = !link.IsFavorite;
        link.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return await GetLinkByIdAsync(userId, linkId, cancellationToken);
    }

    public async Task<LinkDto> ToggleReadLaterAsync(int userId, int linkId, CancellationToken cancellationToken = default)
    {
        var link = await _context.Links.FirstOrDefaultAsync(l => l.Id == linkId && l.UserId == userId, cancellationToken);
        if (link == null) throw new NotFoundException("Link not found.");

        link.IsReadLater = !link.IsReadLater;
        link.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return await GetLinkByIdAsync(userId, linkId, cancellationToken);
    }

    public async Task<LinkDto> ToggleArchiveAsync(int userId, int linkId, CancellationToken cancellationToken = default)
    {
        var link = await _context.Links.FirstOrDefaultAsync(l => l.Id == linkId && l.UserId == userId, cancellationToken);
        if (link == null) throw new NotFoundException("Link not found.");

        link.IsArchived = !link.IsArchived;
        link.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return await GetLinkByIdAsync(userId, linkId, cancellationToken);
    }

    public async Task<LinkDto> ToggleWatchedAsync(int userId, int linkId, CancellationToken cancellationToken = default)
    {
        var link = await _context.Links.FirstOrDefaultAsync(l => l.Id == linkId && l.UserId == userId, cancellationToken);
        if (link == null) throw new NotFoundException("Link not found.");

        link.Watched = !link.Watched;
        if (link.Watched && link.WatchCount == 0)
        {
            link.WatchCount = 1;
        }
        link.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return await GetLinkByIdAsync(userId, linkId, cancellationToken);
    }

    public async Task<LinkDto> RateLinkAsync(int userId, int linkId, int rating, CancellationToken cancellationToken = default)
    {
        var link = await _context.Links.FirstOrDefaultAsync(l => l.Id == linkId && l.UserId == userId, cancellationToken);
        if (link == null) throw new NotFoundException("Link not found.");

        link.Rating = rating;
        if (rating >= 4)
        {
            link.RewatchWorthy = true;
        }
        link.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return await GetLinkByIdAsync(userId, linkId, cancellationToken);
    }

    public async Task<int> SeedUserDataAsync(int userId, SeedUserImportDto seedData, CancellationToken cancellationToken = default)
    {
        int addedCount = 0;

        foreach (var colDto in seedData.Collections)
        {
            if (string.IsNullOrWhiteSpace(colDto.CollectionName)) continue;
            var colName = colDto.CollectionName.Trim();

            var collection = await _context.Collections
                .FirstOrDefaultAsync(c => c.UserId == userId && c.Name.ToLower() == colName.ToLower(), cancellationToken);

            if (collection == null)
            {
                collection = new Collection
                {
                    UserId = userId,
                    Name = colName,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Collections.Add(collection);
                await _context.SaveChangesAsync(cancellationToken);
            }

            foreach (var rawUrl in colDto.Links)
            {
                if (string.IsNullOrWhiteSpace(rawUrl)) continue;
                var url = rawUrl.Trim();

                var exists = await _context.Links.AnyAsync(l => l.UserId == userId && l.Url == url, cancellationToken);
                if (exists) continue;

                var domain = ExtractDomain(url);
                var title = GetFallbackTitle(url, domain);

                var linkItem = new LinkItem
                {
                    UserId = userId,
                    CollectionId = collection.Id,
                    Url = url,
                    Title = title,
                    Domain = domain,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Links.Add(linkItem);
                addedCount++;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return addedCount;
    }

    public async Task<DuplicateCheckDto> CheckDuplicateAsync(int userId, string rawUrl, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(rawUrl))
        {
            return new DuplicateCheckDto { Exists = false };
        }

        var normalized = rawUrl.Trim().TrimEnd('/');
        var altSlash = normalized + "/";

        var existing = await _context.Links
            .Include(l => l.Collection)
            .Include(l => l.LinkTags).ThenInclude(lt => lt.Tag)
            .FirstOrDefaultAsync(l => l.UserId == userId && (l.Url == normalized || l.Url == altSlash), cancellationToken);

        if (existing == null)
        {
            return new DuplicateCheckDto { Exists = false };
        }

        return new DuplicateCheckDto
        {
            Exists = true,
            Link = MapToDto(existing),
            CollectionName = existing.Collection?.Name
        };
    }

    public async Task<BulkActionResultDto> ExecuteBulkActionAsync(int userId, BulkLinkActionDto request, CancellationToken cancellationToken = default)
    {
        if (request.LinkIds == null || request.LinkIds.Count == 0)
        {
            return new BulkActionResultDto { SuccessCount = 0, FailedCount = 0, Message = "No links provided." };
        }

        var links = await _context.Links
            .Include(l => l.LinkTags)
            .Where(l => l.UserId == userId && request.LinkIds.Contains(l.Id))
            .ToListAsync(cancellationToken);

        int count = 0;
        var action = request.Action?.Trim().ToLowerInvariant() ?? "";

        switch (action)
        {
            case "delete":
                _context.Links.RemoveRange(links);
                count = links.Count;
                break;

            case "move":
                foreach (var link in links)
                {
                    link.CollectionId = request.TargetCollectionId > 0 ? request.TargetCollectionId : null;
                    link.UpdatedAt = DateTime.UtcNow;
                    count++;
                }
                break;

            case "favorite":
                foreach (var link in links)
                {
                    link.IsFavorite = true;
                    link.UpdatedAt = DateTime.UtcNow;
                    count++;
                }
                break;

            case "unfavorite":
                foreach (var link in links)
                {
                    link.IsFavorite = false;
                    link.UpdatedAt = DateTime.UtcNow;
                    count++;
                }
                break;

            case "readlater":
                foreach (var link in links)
                {
                    link.IsReadLater = true;
                    link.UpdatedAt = DateTime.UtcNow;
                    count++;
                }
                break;

            case "unreadlater":
                foreach (var link in links)
                {
                    link.IsReadLater = false;
                    link.UpdatedAt = DateTime.UtcNow;
                    count++;
                }
                break;

            case "archive":
                foreach (var link in links)
                {
                    link.IsArchived = true;
                    link.UpdatedAt = DateTime.UtcNow;
                    count++;
                }
                break;

            case "unarchive":
                foreach (var link in links)
                {
                    link.IsArchived = false;
                    link.UpdatedAt = DateTime.UtcNow;
                    count++;
                }
                break;

            case "addtag":
                if (!string.IsNullOrWhiteSpace(request.Tag))
                {
                    var tagName = request.Tag.Trim();
                    var tag = await _context.Tags
                        .FirstOrDefaultAsync(t => t.UserId == userId && t.Name.ToLower() == tagName.ToLower(), cancellationToken);

                    if (tag == null)
                    {
                        tag = new Tag { UserId = userId, Name = tagName };
                        _context.Tags.Add(tag);
                        await _context.SaveChangesAsync(cancellationToken);
                    }

                    foreach (var link in links)
                    {
                        if (!link.LinkTags.Any(lt => lt.TagId == tag.Id))
                        {
                            link.LinkTags.Add(new LinkTag { LinkItemId = link.Id, TagId = tag.Id });
                            link.UpdatedAt = DateTime.UtcNow;
                            count++;
                        }
                    }
                }
                break;

            default:
                return new BulkActionResultDto { SuccessCount = 0, FailedCount = links.Count, Message = $"Unknown action '{request.Action}'." };
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new BulkActionResultDto
        {
            SuccessCount = count,
            FailedCount = request.LinkIds.Count - count,
            Message = $"Successfully applied '{request.Action}' to {count} link(s)."
        };
    }

    public async Task<int> ImportBatchLinksAsync(int userId, List<CreateLinkDto> items, CancellationToken cancellationToken = default)
    {
        if (items == null || items.Count == 0) return 0;

        int added = 0;
        var now = DateTime.UtcNow;

        foreach (var item in items)
        {
            if (string.IsNullOrWhiteSpace(item.Url)) continue;

            int? colId = item.CollectionId;
            if ((!colId.HasValue || colId.Value <= 0) && !string.IsNullOrWhiteSpace(item.CollectionName))
            {
                var colName = item.CollectionName.Trim();
                var col = await _context.Collections
                    .FirstOrDefaultAsync(c => c.UserId == userId && c.Name.ToLower() == colName.ToLower(), cancellationToken);

                if (col == null)
                {
                    col = new Collection { UserId = userId, Name = colName, CreatedAt = now, UpdatedAt = now };
                    _context.Collections.Add(col);
                    await _context.SaveChangesAsync(cancellationToken);
                }
                colId = col.Id;
            }

            var domain = ExtractDomain(item.Url);
            var title = !string.IsNullOrWhiteSpace(item.Title) ? item.Title : GetFallbackTitle(item.Url, domain);

            var link = new LinkItem
            {
                UserId = userId,
                CollectionId = colId,
                Url = item.Url.Trim(),
                Title = title,
                Domain = domain,
                Notes = item.Notes ?? string.Empty,
                IsFavorite = item.IsFavorite,
                IsReadLater = item.IsReadLater,
                IsArchived = item.IsArchived,
                Rating = item.Rating,
                Review = item.Review ?? string.Empty,
                Watched = item.Watched,
                WatchCount = item.WatchCount,
                RewatchWorthy = item.RewatchWorthy,
                CreatedAt = now,
                UpdatedAt = now
            };

            _context.Links.Add(link);
            await _context.SaveChangesAsync(cancellationToken);

            if (item.CustomTags != null && item.CustomTags.Count > 0)
            {
                await AttachTagsAsync(userId, link, item.CustomTags, cancellationToken);
            }

            added++;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return added;
    }

    public async Task<PublicCollectionDto> GetPublicCollectionAsync(int collectionId, CancellationToken cancellationToken = default)
    {
        var col = await _context.Collections
            .Include(c => c.User)
            .Include(c => c.Links)
                .ThenInclude(l => l.LinkTags)
                    .ThenInclude(lt => lt.Tag)
            .FirstOrDefaultAsync(c => c.Id == collectionId, cancellationToken);

        if (col == null)
        {
            throw new NotFoundException("Collection not found or not available.");
        }

        var publicLinks = col.Links
            .Where(l => !l.IsArchived)
            .OrderByDescending(l => l.CreatedAt)
            .Select(MapToDto)
            .ToList();

        return new PublicCollectionDto
        {
            Id = col.Id,
            Name = col.Name,
            AuthorName = col.User?.Name ?? col.User?.Username ?? "LinkCollect Curator",
            CreatedAt = col.CreatedAt,
            LinksCount = publicLinks.Count,
            Links = publicLinks
        };
    }

    private async Task AttachTagsAsync(int userId, LinkItem linkItem, IEnumerable<string> tagNames, CancellationToken cancellationToken)
    {
        foreach (var rawTag in tagNames)
        {
            if (string.IsNullOrWhiteSpace(rawTag)) continue;
            var tagName = rawTag.Trim();

            var tag = await _context.Tags
                .FirstOrDefaultAsync(t => t.UserId == userId && t.Name.ToLower() == tagName.ToLower(), cancellationToken);

            if (tag == null)
            {
                tag = new Tag
                {
                    UserId = userId,
                    Name = tagName
                };
                _context.Tags.Add(tag);
                await _context.SaveChangesAsync(cancellationToken);
            }

            linkItem.LinkTags.Add(new LinkTag
            {
                LinkItemId = linkItem.Id,
                TagId = tag.Id
            });
        }
    }

    private static LinkDto MapToDto(LinkItem l)
    {
        return new LinkDto
        {
            Id = l.Id,
            Url = l.Url,
            CollectionId = l.CollectionId,
            CollectionName = l.Collection?.Name ?? string.Empty,
            Title = l.Title,
            Domain = l.Domain,
            Notes = l.Notes,
            CustomTags = l.LinkTags.Where(lt => lt.Tag != null).Select(lt => lt.Tag!.Name).ToList(),
            IsFavorite = l.IsFavorite,
            IsReadLater = l.IsReadLater,
            IsArchived = l.IsArchived,
            Rating = l.Rating,
            Review = l.Review,
            Watched = l.Watched,
            WatchCount = l.WatchCount,
            RewatchWorthy = l.RewatchWorthy,
            CreatedAt = l.CreatedAt,
            UpdatedAt = l.UpdatedAt
        };
    }

    private static string ExtractDomain(string url)
    {
        try
        {
            var uri = new Uri(url);
            return uri.Host.Replace("www.", "");
        }
        catch
        {
            return "link";
        }
    }

    private static string GetFallbackTitle(string url, string domain)
    {
        try
        {
            var uri = new Uri(url);
            var lastSegment = uri.Segments.LastOrDefault()?.Trim('/');
            if (!string.IsNullOrWhiteSpace(lastSegment) && lastSegment.Length > 2)
            {
                // Clean slug into title
                var cleaned = lastSegment.Replace("-", " ").Replace("_", " ");
                if (cleaned.EndsWith(".html", StringComparison.OrdinalIgnoreCase))
                {
                    cleaned = cleaned.Substring(0, cleaned.Length - 5);
                }
                if (cleaned.Length > 60) cleaned = cleaned.Substring(0, 60) + "...";
                return char.ToUpper(cleaned[0]) + cleaned.Substring(1);
            }
        }
        catch { }

        return $"{domain} resource";
    }
}
