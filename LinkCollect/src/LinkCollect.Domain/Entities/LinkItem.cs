namespace LinkCollect.Domain.Entities;

public class LinkItem
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? CollectionId { get; set; }

    public string Url { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;

    public bool IsFavorite { get; set; }
    public bool IsReadLater { get; set; }
    public bool IsArchived { get; set; }

    public int Rating { get; set; }
    public string Review { get; set; } = string.Empty;
    public bool Watched { get; set; }
    public int WatchCount { get; set; }
    public bool RewatchWorthy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User? User { get; set; }
    public Collection? Collection { get; set; }
    public ICollection<LinkTag> LinkTags { get; set; } = new List<LinkTag>();
}
