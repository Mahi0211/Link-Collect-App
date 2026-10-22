namespace LinkCollect.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Collection> Collections { get; set; } = new List<Collection>();
    public ICollection<LinkItem> Links { get; set; } = new List<LinkItem>();
    public ICollection<Tag> Tags { get; set; } = new List<Tag>();
}
