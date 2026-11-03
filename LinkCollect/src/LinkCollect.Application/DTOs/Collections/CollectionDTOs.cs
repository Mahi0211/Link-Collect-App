using System.ComponentModel.DataAnnotations;

namespace LinkCollect.Application.DTOs.Collections;

public class CollectionDto
{
    public int Id { get; set; }
    public string CollectionName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsPublic { get; set; }
    public int TotalLinks { get; set; }
    public double AverageRating { get; set; }
    public int TotalRatings { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateCollectionDto
{
    [Required]
    [MaxLength(150)]
    public string CollectionName { get; set; } = string.Empty;
    [MaxLength(500)]
    public string? Description { get; set; }
    public bool IsPublic { get; set; } = false;
}

public class UpdateCollectionDto
{
    [MaxLength(150)]
    public string? CollectionName { get; set; }
    [MaxLength(500)]
    public string? Description { get; set; }
    public bool? IsPublic { get; set; }
}
