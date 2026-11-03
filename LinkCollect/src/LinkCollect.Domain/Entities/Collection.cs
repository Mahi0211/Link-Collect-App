namespace LinkCollect.Domain.Entities;

public class Collection
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsPublic { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User? User { get; set; }
    public ICollection<LinkItem> Links { get; set; } = new List<LinkItem>();
    public ICollection<CollectionRating> Ratings { get; set; } = new List<CollectionRating>();
}
