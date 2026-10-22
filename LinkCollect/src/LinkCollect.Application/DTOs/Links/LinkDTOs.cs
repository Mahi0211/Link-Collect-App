using System.ComponentModel.DataAnnotations;

namespace LinkCollect.Application.DTOs.Links;

public class LinkDto
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string Link => Url; // React frontend compatibility alias
    public int? CollectionId { get; set; }
    public string CollectionName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public List<string> CustomTags { get; set; } = new();

    public bool IsFavorite { get; set; }
    public bool IsReadLater { get; set; }
    public bool IsArchived { get; set; }

    public int Rating { get; set; }
    public string Review { get; set; } = string.Empty;
    public bool Watched { get; set; }
    public int WatchCount { get; set; }
    public bool RewatchWorthy { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateLinkDto
{
    [Required]
    public string Url { get; set; } = string.Empty;

    public string? Title { get; set; }
    public string? CollectionName { get; set; }
    public int? CollectionId { get; set; }
    public string? Notes { get; set; }
    public List<string>? CustomTags { get; set; }
    public bool IsFavorite { get; set; }
    public bool IsReadLater { get; set; }
    public bool IsArchived { get; set; }
    public int Rating { get; set; }
    public string? Review { get; set; }
    public bool Watched { get; set; }
    public int WatchCount { get; set; }
    public bool RewatchWorthy { get; set; }
}

public class UpdateLinkDto
{
    public string? Url { get; set; }
    public string? Title { get; set; }
    public string? CollectionName { get; set; }
    public int? CollectionId { get; set; }
    public string? Notes { get; set; }
    public List<string>? CustomTags { get; set; }
    public bool? IsFavorite { get; set; }
    public bool? IsReadLater { get; set; }
    public bool? IsArchived { get; set; }
    public int? Rating { get; set; }
    public string? Review { get; set; }
    public bool? Watched { get; set; }
    public int? WatchCount { get; set; }
    public bool? RewatchWorthy { get; set; }
}

public class RateLinkDto
{
    [Range(0, 5)]
    public int Rating { get; set; }
}

public class ImportCollectionSeedDto
{
    public string CollectionName { get; set; } = string.Empty;
    public List<string> Links { get; set; } = new();
}

public class SeedUserImportDto
{
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public List<ImportCollectionSeedDto> Collections { get; set; } = new();
}
