using Microsoft.EntityFrameworkCore;
using LinkCollect.Application.Common.Exceptions;
using LinkCollect.Application.Common.Interfaces;
using LinkCollect.Application.DTOs.Friends;
using LinkCollect.Domain.Entities;

namespace LinkCollect.Application.Services;

public class SocialService : ISocialService
{
    private readonly IApplicationDbContext _context;
    private readonly IFriendService _friendService;

    public SocialService(IApplicationDbContext context, IFriendService friendService)
    {
        _context = context;
        _friendService = friendService;
    }

    public async Task<List<SharedCollectionDto>> GetFriendPublicCollectionsAsync(int currentUserId, int friendId, CancellationToken cancellationToken = default)
    {
        if (currentUserId != friendId && !await _friendService.AreFriendsAsync(currentUserId, friendId, cancellationToken))
        {
            throw new NotFoundException("User not found or is not in your friends list.");
        }

        var friend = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == friendId, cancellationToken);

        if (friend == null)
        {
            throw new NotFoundException("User not found.");
        }

        var collections = await _context.Collections
            .AsNoTracking()
            .Where(c => c.UserId == friendId && c.IsPublic)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new SharedCollectionDto
            {
                Id = c.Id,
                CollectionName = c.Name,
                Description = c.Description,
                OwnerId = friend.Id,
                OwnerUsername = friend.Username,
                OwnerName = friend.Name,
                TotalLinks = c.Links.Count(l => l.IsPublic && !l.IsArchived),
                AverageRating = c.Ratings.Any() ? Math.Round(c.Ratings.Average(r => r.Score), 1) : 0,
                TotalRatings = c.Ratings.Count,
                CurrentUserRating = c.Ratings.Where(r => r.UserId == currentUserId).Select(r => (int?)r.Score).FirstOrDefault(),
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return collections;
    }

    public async Task<SharedCollectionDto> GetPublicCollectionDetailsAsync(int currentUserId, int collectionId, CancellationToken cancellationToken = default)
    {
        var collection = await _context.Collections
            .AsNoTracking()
            .Where(c => c.Id == collectionId && c.IsPublic)
            .Select(c => new SharedCollectionDto
            {
                Id = c.Id,
                CollectionName = c.Name,
                Description = c.Description,
                OwnerId = c.UserId,
                OwnerUsername = c.User != null ? c.User.Username : "",
                OwnerName = c.User != null ? c.User.Name : "",
                TotalLinks = c.Links.Count(l => l.IsPublic && !l.IsArchived),
                AverageRating = c.Ratings.Any() ? Math.Round(c.Ratings.Average(r => r.Score), 1) : 0,
                TotalRatings = c.Ratings.Count,
                CurrentUserRating = c.Ratings.Where(r => r.UserId == currentUserId).Select(r => (int?)r.Score).FirstOrDefault(),
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (collection == null)
        {
            throw new NotFoundException("Collection not found or is private.");
        }

        if (collection.OwnerId != currentUserId && !await _friendService.AreFriendsAsync(currentUserId, collection.OwnerId, cancellationToken))
        {
            throw new NotFoundException("Collection not found or is private.");
        }

        return collection;
    }

    public async Task<List<SharedLinkDto>> GetPublicCollectionLinksAsync(int currentUserId, int collectionId, CancellationToken cancellationToken = default)
    {
        var collection = await _context.Collections
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == collectionId && c.IsPublic, cancellationToken);

        if (collection == null)
        {
            throw new NotFoundException("Collection not found or is private.");
        }

        if (collection.UserId != currentUserId && !await _friendService.AreFriendsAsync(currentUserId, collection.UserId, cancellationToken))
        {
            throw new NotFoundException("Collection not found or is private.");
        }

        var links = await _context.Links
            .AsNoTracking()
            .Include(l => l.LinkTags)
                .ThenInclude(lt => lt.Tag)
            .Where(l => l.CollectionId == collectionId && l.IsPublic && !l.IsArchived)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync(cancellationToken);

        return links.Select(l => new SharedLinkDto
        {
            Id = l.Id,
            Url = l.Url,
            Title = l.Title,
            Domain = l.Domain,
            Notes = l.Notes,
            CustomTags = l.LinkTags.Where(lt => lt.Tag != null).Select(lt => lt.Tag!.Name).ToList(),
            Rating = l.Rating,
            Watched = l.Watched,
            CreatedAt = l.CreatedAt
        }).ToList();
    }

    public async Task<CollectionRatingDto> RateCollectionAsync(int currentUserId, int collectionId, RateCollectionDto request, CancellationToken cancellationToken = default)
    {
        var collection = await _context.Collections
            .FirstOrDefaultAsync(c => c.Id == collectionId && c.IsPublic, cancellationToken);

        if (collection == null)
        {
            throw new NotFoundException("Collection not found or is private.");
        }

        if (collection.UserId == currentUserId)
        {
            throw new BadRequestException("You cannot rate your own collection.");
        }

        if (!await _friendService.AreFriendsAsync(currentUserId, collection.UserId, cancellationToken))
        {
            throw new NotFoundException("Collection not found or is private.");
        }

        var existingRating = await _context.CollectionRatings
            .FirstOrDefaultAsync(r => r.CollectionId == collectionId && r.UserId == currentUserId, cancellationToken);

        if (existingRating != null)
        {
            existingRating.Score = request.Score;
            existingRating.Review = request.Review?.Trim();
            existingRating.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);

            var user = await _context.Users.FindAsync(new object[] { currentUserId }, cancellationToken);

            return new CollectionRatingDto
            {
                Id = existingRating.Id,
                CollectionId = collectionId,
                UserId = currentUserId,
                Username = user?.Username ?? "",
                Score = existingRating.Score,
                Review = existingRating.Review,
                CreatedAt = existingRating.CreatedAt
            };
        }

        var newRating = new CollectionRating
        {
            CollectionId = collectionId,
            UserId = currentUserId,
            Score = request.Score,
            Review = request.Review?.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.CollectionRatings.Add(newRating);
        await _context.SaveChangesAsync(cancellationToken);

        var currentUser = await _context.Users.FindAsync(new object[] { currentUserId }, cancellationToken);

        return new CollectionRatingDto
        {
            Id = newRating.Id,
            CollectionId = collectionId,
            UserId = currentUserId,
            Username = currentUser?.Username ?? "",
            Score = newRating.Score,
            Review = newRating.Review,
            CreatedAt = newRating.CreatedAt
        };
    }

    public async Task<List<CollectionRatingDto>> GetCollectionRatingsAsync(int currentUserId, int collectionId, CancellationToken cancellationToken = default)
    {
        var collection = await _context.Collections
            .FirstOrDefaultAsync(c => c.Id == collectionId && c.IsPublic, cancellationToken);

        if (collection == null)
        {
            throw new NotFoundException("Collection not found or is private.");
        }

        if (collection.UserId != currentUserId && !await _friendService.AreFriendsAsync(currentUserId, collection.UserId, cancellationToken))
        {
            throw new NotFoundException("Collection not found or is private.");
        }

        var ratings = await _context.CollectionRatings
            .Include(r => r.User)
            .Where(r => r.CollectionId == collectionId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);

        return ratings.Select(r => new CollectionRatingDto
        {
            Id = r.Id,
            CollectionId = r.CollectionId,
            UserId = r.UserId,
            Username = r.User?.Username ?? "",
            Score = r.Score,
            Review = r.Review,
            CreatedAt = r.CreatedAt
        }).ToList();
    }

    public async Task<List<SharedLinkDto>> GetFriendsFeedAsync(int currentUserId, int limit = 30, CancellationToken cancellationToken = default)
    {
        // 1. Get friend IDs
        var friendships = await _context.Friendships
            .Where(f => f.User1Id == currentUserId || f.User2Id == currentUserId)
            .ToListAsync(cancellationToken);

        var friendIds = friendships
            .Select(f => f.User1Id == currentUserId ? f.User2Id : f.User1Id)
            .Distinct()
            .ToList();

        if (friendIds.Count == 0)
        {
            return new List<SharedLinkDto>();
        }

        // 2. Query public links from these friends
        var links = await _context.Links
            .Include(l => l.LinkTags)
                .ThenInclude(lt => lt.Tag)
            .Where(l => friendIds.Contains(l.UserId) && l.IsPublic && !l.IsArchived)
            .OrderByDescending(l => l.CreatedAt)
            .Take(limit)
            .ToListAsync(cancellationToken);

        return links.Select(l => new SharedLinkDto
        {
            Id = l.Id,
            Url = l.Url,
            Title = l.Title,
            Domain = l.Domain,
            Notes = l.Notes,
            CustomTags = l.LinkTags.Where(lt => lt.Tag != null).Select(lt => lt.Tag!.Name).ToList(),
            Rating = l.Rating,
            Watched = l.Watched,
            CreatedAt = l.CreatedAt
        }).ToList();
    }
}

