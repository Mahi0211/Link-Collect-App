using LinkCollect.Application.DTOs.Links;

namespace LinkCollect.Application.Common.Interfaces;

public interface IMetadataService
{
    Task<UrlMetadataDto> ScrapeMetadataAsync(string url, CancellationToken cancellationToken = default);
    Task<LinkStatusDto> CheckLinkStatusAsync(string url, int linkId = 0, CancellationToken cancellationToken = default);
}
