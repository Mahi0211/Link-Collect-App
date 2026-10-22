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

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
