using LinkCollect.Application.DTOs.Friends;

namespace LinkCollect.Application.Common.Interfaces;

public interface IFriendService
{
    Task<List<FriendDto>> GetFriendsAsync(int currentUserId, CancellationToken cancellationToken = default);
    Task<List<FriendRequestDto>> GetPendingRequestsAsync(int currentUserId, CancellationToken cancellationToken = default);
    Task<FriendRequestDto> SendFriendRequestAsync(int currentUserId, SendFriendRequestDto request, CancellationToken cancellationToken = default);
    Task AcceptFriendRequestAsync(int currentUserId, int requestId, CancellationToken cancellationToken = default);
    Task RejectFriendRequestAsync(int currentUserId, int requestId, CancellationToken cancellationToken = default);
    Task RemoveFriendAsync(int currentUserId, int friendUserId, CancellationToken cancellationToken = default);
    Task<List<UserSearchDto>> SearchUsersAsync(int currentUserId, string query, CancellationToken cancellationToken = default);
    Task<bool> AreFriendsAsync(int userA, int userB, CancellationToken cancellationToken = default);
}

