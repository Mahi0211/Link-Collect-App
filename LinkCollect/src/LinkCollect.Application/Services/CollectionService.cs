using Microsoft.EntityFrameworkCore;
using LinkCollect.Application.Common.Exceptions;
using LinkCollect.Application.Common.Interfaces;
using LinkCollect.Application.DTOs.Collections;
using LinkCollect.Domain.Entities;

namespace LinkCollect.Application.Services;

public class CollectionService : ICollectionService
{
    private readonly IApplicationDbContext _context;

    public CollectionService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CollectionDto>> GetUserCollectionsAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _context.Collections
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new CollectionDto
            {
                Id = c.Id,
                CollectionName = c.Name,
                TotalLinks = c.Links.Count,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<CollectionDto> CreateCollectionAsync(int userId, CreateCollectionDto request, CancellationToken cancellationToken = default)
    {
        var trimmedName = request.CollectionName.Trim();

        var exists = await _context.Collections
            .AnyAsync(c => c.UserId == userId && c.Name.ToLower() == trimmedName.ToLower(), cancellationToken);

        if (exists)
        {
            throw new BadRequestException("A collection with this name already exists.");
        }

        var collection = new Collection
        {
            UserId = userId,
            Name = trimmedName,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Collections.Add(collection);
        await _context.SaveChangesAsync(cancellationToken);

        return new CollectionDto
        {
            Id = collection.Id,
            CollectionName = collection.Name,
            TotalLinks = 0,
            CreatedAt = collection.CreatedAt,
            UpdatedAt = collection.UpdatedAt
        };
    }

    public async Task<CollectionDto> UpdateCollectionAsync(int userId, int collectionId, UpdateCollectionDto request, CancellationToken cancellationToken = default)
    {
        var collection = await _context.Collections
            .Include(c => c.Links)
            .FirstOrDefaultAsync(c => c.Id == collectionId && c.UserId == userId, cancellationToken);

        if (collection == null)
        {
            throw new NotFoundException("Collection not found.");
        }

        var trimmedName = request.CollectionName.Trim();
        var nameConflict = await _context.Collections
            .AnyAsync(c => c.UserId == userId && c.Id != collectionId && c.Name.ToLower() == trimmedName.ToLower(), cancellationToken);

        if (nameConflict)
        {
            throw new BadRequestException("Another collection with this name already exists.");
        }

        collection.Name = trimmedName;
        collection.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return new CollectionDto
        {
            Id = collection.Id,
            CollectionName = collection.Name,
            TotalLinks = collection.Links.Count,
            CreatedAt = collection.CreatedAt,
            UpdatedAt = collection.UpdatedAt
        };
    }

    public async Task DeleteCollectionAsync(int userId, int collectionId, CancellationToken cancellationToken = default)
    {
        var collection = await _context.Collections
            .Include(c => c.Links)
            .FirstOrDefaultAsync(c => c.Id == collectionId && c.UserId == userId, cancellationToken);

        if (collection == null)
        {
            throw new NotFoundException("Collection not found.");
        }

        // When a collection is deleted, we can either delete links or nullify their collectionId.
        // Let's delete the collection and its associated links so collections behave cleanly as folders.
        _context.Links.RemoveRange(collection.Links);
        _context.Collections.Remove(collection);

        await _context.SaveChangesAsync(cancellationToken);
    }
}
