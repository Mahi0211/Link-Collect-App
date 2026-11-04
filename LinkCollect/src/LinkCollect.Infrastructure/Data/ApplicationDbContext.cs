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
    public DbSet<FriendRequest> FriendRequests => Set<FriendRequest>();
    public DbSet<Friendship> Friendships => Set<Friendship>();
    public DbSet<CollectionRating> CollectionRatings => Set<CollectionRating>();

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
            entity.Property(u => u.RoleTitle).HasMaxLength(150);
            entity.Property(u => u.Location).HasMaxLength(150);
            entity.Property(u => u.Bio).HasMaxLength(500);
            entity.Property(u => u.AvatarUrl).HasColumnType("longtext");
            entity.Property(u => u.CoverUrl).HasColumnType("longtext");
            entity.Property(u => u.SocialLinksJson).HasColumnType("longtext");
            entity.Property(u => u.PasswordHash).IsRequired().HasMaxLength(255);
        });

        // Collection
        modelBuilder.Entity<Collection>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Name).IsRequired().HasMaxLength(150);
            entity.Property(c => c.Description).HasMaxLength(500);
            entity.Property(c => c.IsPublic).HasDefaultValue(false);
            entity.HasIndex(c => new { c.UserId, c.Name });
            entity.HasIndex(c => new { c.UserId, c.IsPublic });

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
            entity.Property(l => l.IsPublic).HasDefaultValue(false);

            entity.HasIndex(l => l.UserId);
            entity.HasIndex(l => l.CollectionId);
            entity.HasIndex(l => new { l.UserId, l.IsFavorite });
            entity.HasIndex(l => new { l.UserId, l.IsReadLater });
            entity.HasIndex(l => new { l.UserId, l.IsArchived });
            entity.HasIndex(l => new { l.UserId, l.IsPublic });
            entity.HasIndex(l => new { l.CollectionId, l.IsPublic });

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

        // FriendRequest
        modelBuilder.Entity<FriendRequest>(entity =>
        {
            entity.HasKey(fr => fr.Id);
            entity.Property(fr => fr.Status).IsRequired().HasMaxLength(20);
            entity.HasIndex(fr => new { fr.SenderId, fr.ReceiverId }).IsUnique();
            entity.HasIndex(fr => new { fr.ReceiverId, fr.Status });

            entity.HasOne(fr => fr.Sender)
                .WithMany(u => u.SentFriendRequests)
                .HasForeignKey(fr => fr.SenderId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(fr => fr.Receiver)
                .WithMany(u => u.ReceivedFriendRequests)
                .HasForeignKey(fr => fr.ReceiverId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Friendship
        modelBuilder.Entity<Friendship>(entity =>
        {
            entity.HasKey(f => f.Id);
            entity.HasIndex(f => new { f.User1Id, f.User2Id }).IsUnique();
            entity.HasIndex(f => f.User1Id);
            entity.HasIndex(f => f.User2Id);

            entity.HasOne(f => f.User1)
                .WithMany(u => u.FriendshipsAsUser1)
                .HasForeignKey(f => f.User1Id)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(f => f.User2)
                .WithMany(u => u.FriendshipsAsUser2)
                .HasForeignKey(f => f.User2Id)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // CollectionRating
        modelBuilder.Entity<CollectionRating>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Review).HasMaxLength(500);
            entity.HasIndex(r => new { r.CollectionId, r.UserId }).IsUnique();
            entity.HasIndex(r => r.CollectionId);

            entity.HasOne(r => r.Collection)
                .WithMany(c => c.Ratings)
                .HasForeignKey(r => r.CollectionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.User)
                .WithMany(u => u.CollectionRatings)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
