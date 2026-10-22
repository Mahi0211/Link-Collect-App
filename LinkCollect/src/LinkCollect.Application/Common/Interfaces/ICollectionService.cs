using LinkCollect.Application.DTOs.Collections;

namespace LinkCollect.Application.Common.Interfaces;

public interface ICollectionService
{
    Task<List<CollectionDto>> GetUserCollectionsAsync(int userId, CancellationToken cancellationToken = default);
    Task<CollectionDto> CreateCollectionAsync(int userId, CreateCollectionDto request, CancellationToken cancellationToken = default);
    Task<CollectionDto> UpdateCollectionAsync(int userId, int collectionId, UpdateCollectionDto request, CancellationToken cancellationToken = default);
    Task DeleteCollectionAsync(int userId, int collectionId, CancellationToken cancellationToken = default);
}
