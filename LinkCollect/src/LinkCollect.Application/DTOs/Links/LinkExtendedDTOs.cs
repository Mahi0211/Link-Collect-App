namespace LinkCollect.Application.DTOs.Links;

public class UrlMetadataDto
{
    public string Url { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Image { get; set; }
    public string Domain { get; set; } = string.Empty;
    public string? Favicon { get; set; }
    public string? SiteName { get; set; }
    public List<string> Keywords { get; set; } = new();
}

public class DuplicateCheckDto
{
    public bool Exists { get; set; }
    public LinkDto? Link { get; set; }
    public string? CollectionName { get; set; }
}

public class LinkStatusDto
{
    public int LinkId { get; set; }
    public string Url { get; set; } = string.Empty;
    public int StatusCode { get; set; }
    public bool IsAlive { get; set; }
    public long ResponseTimeMs { get; set; }
    public string? StatusText { get; set; }
}

public class BulkLinkActionDto
{
    public List<int> LinkIds { get; set; } = new();
    public string Action { get; set; } = string.Empty; // "delete" | "move" | "archive" | "unarchive" | "favorite" | "unfavorite" | "readLater" | "unreadLater" | "addTag"
    public int? TargetCollectionId { get; set; }
    public string? Tag { get; set; }
}

public class BulkActionResultDto
{
    public int SuccessCount { get; set; }
    public int FailedCount { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class PublicCollectionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string AuthorName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int LinksCount { get; set; }
    public List<LinkDto> Links { get; set; } = new();
}
