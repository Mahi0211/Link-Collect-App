namespace LinkCollect.Domain.Entities;

public class FriendRequest
{
    public int Id { get; set; }
    public int SenderId { get; set; }
    public int ReceiverId { get; set; }
    public string Status { get; set; } = "Pending"; // "Pending", "Accepted", "Rejected"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public User? Sender { get; set; }
    public User? Receiver { get; set; }
}

