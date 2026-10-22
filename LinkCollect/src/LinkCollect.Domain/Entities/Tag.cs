namespace LinkCollect.Domain.Entities;

public class Tag
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;

    // Navigation properties
    public User? User { get; set; }
    public ICollection<LinkTag> LinkTags { get; set; } = new List<LinkTag>();
}
