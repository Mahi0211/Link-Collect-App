using Microsoft.EntityFrameworkCore;
using LinkCollect.Application.Common.Exceptions;
using LinkCollect.Application.Common.Interfaces;
using LinkCollect.Application.DTOs.Friends;
using LinkCollect.Domain.Entities;

namespace LinkCollect.Application.Services;

public class FriendService : IFriendService
{
    private readonly IApplicationDbContext _context;

    public FriendService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<FriendDto>> GetFriendsAsync(int currentUserId, CancellationToken cancellationToken = default)
    {
        var friendPairs = await _context.Friendships
            .AsNoTracking()
            .Where(f => f.User1Id == currentUserId || f.User2Id == currentUserId)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new
            {
                FriendUserId = f.User1Id == currentUserId ? f.User2Id : f.User1Id,
                FriendsSince = f.CreatedAt
            })
            .ToListAsync(cancellationToken);

        if (!friendPairs.Any())
        {
            return new List<FriendDto>();
        }

        var friendUserIds = friendPairs.Select(p => p.FriendUserId).ToList();

        var usersInfo = await _context.Users
            .AsNoTracking()
            .Where(u => friendUserIds.Contains(u.Id))
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Name,
                u.Email,
                u.AvatarUrl,
                PublicCollectionsCount = u.Collections.Count(c => c.IsPublic),
                PublicLinksCount = u.Links.Count(l => l.IsPublic && !l.IsArchived)
            })
            .ToListAsync(cancellationToken);

        var usersDict = usersInfo.ToDictionary(u => u.Id);

        var list = new List<FriendDto>();
        foreach (var pair in friendPairs)
        {
            if (usersDict.TryGetValue(pair.FriendUserId, out var u))
            {
                list.Add(new FriendDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Name = u.Name,
                    Email = u.Email,
                    AvatarUrl = u.AvatarUrl,
                    FriendsSince = pair.FriendsSince,
                    PublicCollectionsCount = u.PublicCollectionsCount,
                    PublicLinksCount = u.PublicLinksCount
                });
            }
        }

        return list;
    }

    public async Task<List<FriendRequestDto>> GetPendingRequestsAsync(int currentUserId, CancellationToken cancellationToken = default)
    {
        return await _context.FriendRequests
            .AsNoTracking()
            .Where(fr => fr.ReceiverId == currentUserId && fr.Status == "Pending")
            .OrderByDescending(fr => fr.CreatedAt)
            .Select(fr => new FriendRequestDto
            {
                Id = fr.Id,
                SenderId = fr.SenderId,
                SenderUsername = fr.Sender != null ? fr.Sender.Username : string.Empty,
                SenderName = fr.Sender != null ? fr.Sender.Name : string.Empty,
                ReceiverId = fr.ReceiverId,
                ReceiverUsername = fr.Receiver != null ? fr.Receiver.Username : string.Empty,
                ReceiverName = fr.Receiver != null ? fr.Receiver.Name : string.Empty,
                Status = fr.Status,
                CreatedAt = fr.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<FriendRequestDto> SendFriendRequestAsync(int currentUserId, SendFriendRequestDto request, CancellationToken cancellationToken = default)
    {
        var identifier = request.TargetIdentifier.Trim().ToLowerInvariant();

        var targetUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == identifier || u.Username.ToLower() == identifier, cancellationToken);

        if (targetUser == null)
        {
            throw new NotFoundException("User not found with provided username or email.");
        }

        if (targetUser.Id == currentUserId)
        {
            throw new BadRequestException("You cannot send a friend request to yourself.");
        }

        if (await AreFriendsAsync(currentUserId, targetUser.Id, cancellationToken))
        {
            throw new BadRequestException("You are already friends with this user.");
        }

        // Check if an incoming request from the target user is already pending -> auto-accept
        var incomingRequest = await _context.FriendRequests
            .FirstOrDefaultAsync(fr => fr.SenderId == targetUser.Id && fr.ReceiverId == currentUserId && fr.Status == "Pending", cancellationToken);

        if (incomingRequest != null)
        {
            await AcceptFriendRequestAsync(currentUserId, incomingRequest.Id, cancellationToken);
            return new FriendRequestDto
            {
                Id = incomingRequest.Id,
                SenderId = targetUser.Id,
                SenderUsername = targetUser.Username,
                SenderName = targetUser.Name,
                ReceiverId = currentUserId,
                Status = "Accepted",
                CreatedAt = incomingRequest.CreatedAt
            };
        }

        // Check if outgoing pending request already exists
        var existingOutgoing = await _context.FriendRequests
            .FirstOrDefaultAsync(fr => fr.SenderId == currentUserId && fr.ReceiverId == targetUser.Id, cancellationToken);

        if (existingOutgoing != null)
        {
            if (existingOutgoing.Status == "Pending")
            {
                throw new BadRequestException("A friend request has already been sent to this user.");
            }

            // If previously rejected, allow re-requesting
            existingOutgoing.Status = "Pending";
            existingOutgoing.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);

            var sender = await _context.Users.FindAsync(new object[] { currentUserId }, cancellationToken);

            return new FriendRequestDto
            {
                Id = existingOutgoing.Id,
                SenderId = currentUserId,
                SenderUsername = sender?.Username ?? "",
                SenderName = sender?.Name ?? "",
                ReceiverId = targetUser.Id,
                ReceiverUsername = targetUser.Username,
                ReceiverName = targetUser.Name,
                Status = "Pending",
                CreatedAt = existingOutgoing.CreatedAt
            };
        }

        var friendRequest = new FriendRequest
        {
            SenderId = currentUserId,
            ReceiverId = targetUser.Id,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.FriendRequests.Add(friendRequest);
        await _context.SaveChangesAsync(cancellationToken);

        var currentUser = await _context.Users.FindAsync(new object[] { currentUserId }, cancellationToken);

        return new FriendRequestDto
        {
            Id = friendRequest.Id,
            SenderId = currentUserId,
            SenderUsername = currentUser?.Username ?? "",
            SenderName = currentUser?.Name ?? "",
            ReceiverId = targetUser.Id,
            ReceiverUsername = targetUser.Username,
            ReceiverName = targetUser.Name,
            Status = "Pending",
            CreatedAt = friendRequest.CreatedAt
        };
    }

    public async Task AcceptFriendRequestAsync(int currentUserId, int requestId, CancellationToken cancellationToken = default)
    {
        var request = await _context.FriendRequests
            .FirstOrDefaultAsync(fr => fr.Id == requestId && fr.ReceiverId == currentUserId, cancellationToken);

        if (request == null)
        {
            throw new NotFoundException("Friend request not found.");
        }

        request.Status = "Accepted";
        request.UpdatedAt = DateTime.UtcNow;

        var u1 = Math.Min(request.SenderId, request.ReceiverId);
        var u2 = Math.Max(request.SenderId, request.ReceiverId);

        var existingFriendship = await _context.Friendships
            .AnyAsync(f => f.User1Id == u1 && f.User2Id == u2, cancellationToken);

        if (!existingFriendship)
        {
            _context.Friendships.Add(new Friendship
            {
                User1Id = u1,
                User2Id = u2,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task RejectFriendRequestAsync(int currentUserId, int requestId, CancellationToken cancellationToken = default)
    {
        var request = await _context.FriendRequests
            .FirstOrDefaultAsync(fr => fr.Id == requestId && fr.ReceiverId == currentUserId, cancellationToken);

        if (request == null)
        {
            throw new NotFoundException("Friend request not found.");
        }

        _context.FriendRequests.Remove(request);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task RemoveFriendAsync(int currentUserId, int friendUserId, CancellationToken cancellationToken = default)
    {
        var u1 = Math.Min(currentUserId, friendUserId);
        var u2 = Math.Max(currentUserId, friendUserId);

        var friendship = await _context.Friendships
            .FirstOrDefaultAsync(f => f.User1Id == u1 && f.User2Id == u2, cancellationToken);

        if (friendship != null)
        {
            _context.Friendships.Remove(friendship);
        }

        // Clean up any historical requests between these two users
        var requests = await _context.FriendRequests
            .Where(fr => (fr.SenderId == currentUserId && fr.ReceiverId == friendUserId) ||
                         (fr.SenderId == friendUserId && fr.ReceiverId == currentUserId))
            .ToListAsync(cancellationToken);

        if (requests.Count > 0)
        {
            _context.FriendRequests.RemoveRange(requests);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<UserSearchDto>> SearchUsersAsync(int currentUserId, string query, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Trim().Length < 2)
        {
            return new List<UserSearchDto>();
        }

        var q = query.Trim().ToLowerInvariant();

        var users = await _context.Users
            .Where(u => u.Id != currentUserId && (
                u.Username.ToLower().Contains(q) ||
                u.Email.ToLower().Contains(q) ||
                u.Name.ToLower().Contains(q)
            ))
            .Take(15)
            .ToListAsync(cancellationToken);

        var result = new List<UserSearchDto>();

        foreach (var u in users)
        {
            var status = "None";
            int? reqId = null;

            if (await AreFriendsAsync(currentUserId, u.Id, cancellationToken))
            {
                status = "Friends";
            }
            else
            {
                var req = await _context.FriendRequests
                    .FirstOrDefaultAsync(fr => (fr.SenderId == currentUserId && fr.ReceiverId == u.Id) ||
                                               (fr.SenderId == u.Id && fr.ReceiverId == currentUserId), cancellationToken);

                if (req != null && req.Status == "Pending")
                {
                    if (req.SenderId == currentUserId)
                    {
                        status = "PendingSent";
                    }
                    else
                    {
                        status = "PendingReceived";
                        reqId = req.Id;
                    }
                }
            }

            result.Add(new UserSearchDto
            {
                Id = u.Id,
                Username = u.Username,
                Name = u.Name,
                Email = u.Email,
                AvatarUrl = u.AvatarUrl,
                FriendshipStatus = status,
                RequestId = reqId
            });
        }

        return result;
    }

    public async Task<bool> AreFriendsAsync(int userA, int userB, CancellationToken cancellationToken = default)
    {
        if (userA == userB) return true;

        var u1 = Math.Min(userA, userB);
        var u2 = Math.Max(userA, userB);

        return await _context.Friendships
            .AnyAsync(f => f.User1Id == u1 && f.User2Id == u2, cancellationToken);
    }
}

