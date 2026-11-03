using LinkCollect.Application.DTOs.Friends;

namespace LinkCollect.Application.Common.Interfaces;

public interface ISocialService
{
    Task<List<SharedCollectionDto>> GetFriendPublicCollectionsAsync(int currentUserId, int friendId, CancellationToken cancellationToken = default);
    Task<SharedCollectionDto> GetPublicCollectionDetailsAsync(int currentUserId, int collectionId, CancellationToken cancellationToken = default);
    Task<List<SharedLinkDto>> GetPublicCollectionLinksAsync(int currentUserId, int collectionId, CancellationToken cancellationToken = default);
    Task<CollectionRatingDto> RateCollectionAsync(int currentUserId, int collectionId, RateCollectionDto request, CancellationToken cancellationToken = default);
    Task<List<CollectionRatingDto>> GetCollectionRatingsAsync(int currentUserId, int collectionId, CancellationToken cancellationToken = default);
    Task<List<SharedLinkDto>> GetFriendsFeedAsync(int currentUserId, int limit = 30, CancellationToken cancellationToken = default);
}

