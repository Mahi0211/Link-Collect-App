using System.ComponentModel.DataAnnotations;

namespace LinkCollect.Application.DTOs.Friends;

public class FriendDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public DateTime FriendsSince { get; set; }
    public int PublicCollectionsCount { get; set; }
    public int PublicLinksCount { get; set; }
}

public class FriendRequestDto
{
    public int Id { get; set; }
    public int SenderId { get; set; }
    public string SenderUsername { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;
    public int ReceiverId { get; set; }
    public string ReceiverUsername { get; set; } = string.Empty;
    public string ReceiverName { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; }
}

public class SendFriendRequestDto
{
    [Required]
    public string TargetIdentifier { get; set; } = string.Empty; // username or email
}

public class UserSearchDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string FriendshipStatus { get; set; } = "None"; // "None", "Friends", "PendingSent", "PendingReceived"
    public int? RequestId { get; set; }
}

public class SharedCollectionDto
{
    public int Id { get; set; }
    public string CollectionName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int OwnerId { get; set; }
    public string OwnerUsername { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public int TotalLinks { get; set; }
    public double AverageRating { get; set; }
    public int TotalRatings { get; set; }
    public int? CurrentUserRating { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class SharedLinkDto
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public List<string> CustomTags { get; set; } = new();
    public int Rating { get; set; }
    public bool Watched { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class RateCollectionDto
{
    [Range(1, 5)]
    public int Score { get; set; }
    [MaxLength(500)]
    public string? Review { get; set; }
}

public class CollectionRatingDto
{
    public int Id { get; set; }
    public int CollectionId { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public int Score { get; set; }
    public string? Review { get; set; }
    public DateTime CreatedAt { get; set; }
}

