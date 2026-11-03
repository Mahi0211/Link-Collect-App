using Microsoft.EntityFrameworkCore;
using LinkCollect.Domain.Entities;

namespace LinkCollect.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Collection> Collections { get; }
    DbSet<LinkItem> Links { get; }
    DbSet<Tag> Tags { get; }
    DbSet<LinkTag> LinkTags { get; }
    DbSet<FriendRequest> FriendRequests { get; }
    DbSet<Friendship> Friendships { get; }
    DbSet<CollectionRating> CollectionRatings { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
