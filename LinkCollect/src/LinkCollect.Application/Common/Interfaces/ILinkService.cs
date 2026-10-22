using LinkCollect.Application.DTOs.Links;

namespace LinkCollect.Application.Common.Interfaces;

public interface ILinkService
{
    Task<List<LinkDto>> GetUserLinksAsync(
        int userId,
        int? collectionId = null,
        string? view = null, // "favorites" | "readLater" | "archive" | "topRated" | "rewatch" | "watched"
        string? tag = null,
        string? search = null,
        string? sort = null,
        CancellationToken cancellationToken = default);

    Task<LinkDto> GetLinkByIdAsync(int userId, int linkId, CancellationToken cancellationToken = default);
    Task<LinkDto> CreateLinkAsync(int userId, CreateLinkDto request, CancellationToken cancellationToken = default);
    Task<LinkDto> UpdateLinkAsync(int userId, int linkId, UpdateLinkDto request, CancellationToken cancellationToken = default);
    Task DeleteLinkAsync(int userId, int linkId, CancellationToken cancellationToken = default);

    Task<LinkDto> ToggleFavoriteAsync(int userId, int linkId, CancellationToken cancellationToken = default);
    Task<LinkDto> ToggleReadLaterAsync(int userId, int linkId, CancellationToken cancellationToken = default);
    Task<LinkDto> ToggleArchiveAsync(int userId, int linkId, CancellationToken cancellationToken = default);
    Task<LinkDto> ToggleWatchedAsync(int userId, int linkId, CancellationToken cancellationToken = default);
    Task<LinkDto> RateLinkAsync(int userId, int linkId, int rating, CancellationToken cancellationToken = default);

    Task<int> SeedUserDataAsync(int userId, SeedUserImportDto seedData, CancellationToken cancellationToken = default);
}
