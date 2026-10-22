using System.ComponentModel.DataAnnotations;

namespace LinkCollect.Application.DTOs.Collections;

public class CollectionDto
{
    public int Id { get; set; }
    public string CollectionName { get; set; } = string.Empty;
    public int TotalLinks { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateCollectionDto
{
    [Required]
    [MaxLength(150)]
    public string CollectionName { get; set; } = string.Empty;
}

public class UpdateCollectionDto
{
    [Required]
    [MaxLength(150)]
    public string CollectionName { get; set; } = string.Empty;
}
