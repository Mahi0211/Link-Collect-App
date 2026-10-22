using LinkCollect.Domain.Entities;

namespace LinkCollect.Application.Common.Interfaces;

public interface ITokenService
{
    string GenerateJwtToken(User user);
}
