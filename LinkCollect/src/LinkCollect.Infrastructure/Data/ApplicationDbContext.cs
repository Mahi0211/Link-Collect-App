using Microsoft.EntityFrameworkCore;
using LinkCollect.Application.Common.Interfaces;
using LinkCollect.Domain.Entities;

namespace LinkCollect.Infrastructure.Data;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Collection> Collections => Set<Collection>();
    public DbSet<LinkItem> Links => Set<LinkItem>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<LinkTag> LinkTags => Set<LinkTag>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.Username).IsUnique();
            entity.Property(u => u.Email).IsRequired().HasMaxLength(255);
            entity.Property(u => u.Username).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Name).HasMaxLength(150);
            entity.Property(u => u.PasswordHash).IsRequired().HasMaxLength(255);
        });

        // Collection
        modelBuilder.Entity<Collection>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Name).IsRequired().HasMaxLength(150);
            entity.HasIndex(c => new { c.UserId, c.Name });

            entity.HasOne(c => c.User)
                .WithMany(u => u.Collections)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // LinkItem
        modelBuilder.Entity<LinkItem>(entity =>
        {
            entity.HasKey(l => l.Id);
            entity.Property(l => l.Url).IsRequired();
            entity.Property(l => l.Title).HasMaxLength(500);
            entity.Property(l => l.Domain).HasMaxLength(255);

            entity.HasIndex(l => l.UserId);
            entity.HasIndex(l => l.CollectionId);
            entity.HasIndex(l => new { l.UserId, l.IsFavorite });
            entity.HasIndex(l => new { l.UserId, l.IsReadLater });
            entity.HasIndex(l => new { l.UserId, l.IsArchived });

            entity.HasOne(l => l.User)
                .WithMany(u => u.Links)
                .HasForeignKey(l => l.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(l => l.Collection)
                .WithMany(c => c.Links)
                .HasForeignKey(l => l.CollectionId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Tag
        modelBuilder.Entity<Tag>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Name).IsRequired().HasMaxLength(100);
            entity.HasIndex(t => new { t.UserId, t.Name });

            entity.HasOne(t => t.User)
                .WithMany(u => u.Tags)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // LinkTag (Many-to-Many Join)
        modelBuilder.Entity<LinkTag>(entity =>
        {
            entity.HasKey(lt => new { lt.LinkItemId, lt.TagId });

            entity.HasOne(lt => lt.LinkItem)
                .WithMany(l => l.LinkTags)
                .HasForeignKey(lt => lt.LinkItemId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(lt => lt.Tag)
                .WithMany(t => t.LinkTags)
                .HasForeignKey(lt => lt.TagId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
