namespace LinkCollect.Domain.Entities;

public class CollectionRating
{
    public int Id { get; set; }
    public int CollectionId { get; set; }
    public int UserId { get; set; }
    public int Score { get; set; }
    public string? Review { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Collection? Collection { get; set; }
    public User? User { get; set; }
}

