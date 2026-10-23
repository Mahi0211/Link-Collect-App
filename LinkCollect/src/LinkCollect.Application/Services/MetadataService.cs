using System.Diagnostics;
using System.Net;
using System.Text.RegularExpressions;
using LinkCollect.Application.Common.Interfaces;
using LinkCollect.Application.DTOs.Links;

namespace LinkCollect.Application.Services;

public class MetadataService : IMetadataService
{
    private static readonly HttpClient HttpClient = new(new HttpClientHandler
    {
        AllowAutoRedirect = true,
        AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate | DecompressionMethods.Brotli,
        ServerCertificateCustomValidationCallback = (_, _, _, _) => true
    })
    {
        Timeout = TimeSpan.FromSeconds(6)
    };

    public MetadataService()
    {
        if (!HttpClient.DefaultRequestHeaders.Contains("User-Agent"))
        {
            HttpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 LinkCollectBot/1.0");
            HttpClient.DefaultRequestHeaders.Add("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8");
            HttpClient.DefaultRequestHeaders.Add("Accept-Language", "en-US,en;q=0.9");
        }
    }

    public async Task<UrlMetadataDto> ScrapeMetadataAsync(string rawUrl, CancellationToken cancellationToken = default)
    {
        var cleanUrl = NormalizeUrl(rawUrl);
        var uri = new Uri(cleanUrl);
        var domain = uri.Host.Replace("www.", "");

        var metadata = new UrlMetadataDto
        {
            Url = cleanUrl,
            Domain = domain,
            Title = FormatFallbackTitle(cleanUrl, domain),
            Favicon = $"https://www.google.com/s2/favicons?sz=128&domain={domain}"
        };

        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(TimeSpan.FromSeconds(5));

            using var request = new HttpRequestMessage(HttpMethod.Get, cleanUrl);
            using var response = await HttpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cts.Token);

            if (!response.IsSuccessStatusCode)
            {
                return metadata;
            }

            var contentType = response.Content.Headers.ContentType?.MediaType?.ToLowerInvariant() ?? "";
            if (!contentType.Contains("text/html") && !contentType.Contains("application/xhtml"))
            {
                // Non-HTML resource
                metadata.Title = $"{domain} ({contentType})";
                return metadata;
            }

            var htmlBytes = await response.Content.ReadAsByteArrayAsync(cts.Token);
            // Limit scanning to first 250KB of HTML where headers & meta tags reside
            var bytesToTake = Math.Min(htmlBytes.Length, 256 * 1024);
            var html = System.Text.Encoding.UTF8.GetString(htmlBytes, 0, bytesToTake);

            // Extract Title
            var title = ExtractMeta(html, @"<meta\s+property=[""']og:title[""']\s+content=[""']([^""']+)[""']",
                                     @"<meta\s+content=[""']([^""']+)[""']\s+property=[""']og:title[""']",
                                     @"<meta\s+name=[""']twitter:title[""']\s+content=[""']([^""']+)[""']",
                                     @"<title[^>]*>([^<]+)</title>");

            if (!string.IsNullOrWhiteSpace(title))
            {
                metadata.Title = WebUtility.HtmlDecode(title.Trim());
            }

            // Extract Description
            var desc = ExtractMeta(html, @"<meta\s+property=[""']og:description[""']\s+content=[""']([^""']+)[""']",
                                        @"<meta\s+content=[""']([^""']+)[""']\s+property=[""']og:description[""']",
                                        @"<meta\s+name=[""']description[""']\s+content=[""']([^""']+)[""']",
                                        @"<meta\s+content=[""']([^""']+)[""']\s+name=[""']description[""']",
                                        @"<meta\s+name=[""']twitter:description[""']\s+content=[""']([^""']+)[""']");

            if (!string.IsNullOrWhiteSpace(desc))
            {
                metadata.Description = WebUtility.HtmlDecode(desc.Trim());
            }

            // Extract Image / OpenGraph Banner
            var image = ExtractMeta(html, @"<meta\s+property=[""']og:image[""']\s+content=[""']([^""']+)[""']",
                                         @"<meta\s+content=[""']([^""']+)[""']\s+property=[""']og:image[""']",
                                         @"<meta\s+name=[""']twitter:image[""']\s+content=[""']([^""']+)[""']");

            if (!string.IsNullOrWhiteSpace(image))
            {
                metadata.Image = ResolveAbsoluteUrl(uri, WebUtility.HtmlDecode(image.Trim()));
            }

            // Extract Site Name
            var siteName = ExtractMeta(html, @"<meta\s+property=[""']og:site_name[""']\s+content=[""']([^""']+)[""']");
            if (!string.IsNullOrWhiteSpace(siteName))
            {
                metadata.SiteName = WebUtility.HtmlDecode(siteName.Trim());
            }

            // Extract Custom Favicon if present
            var favicon = ExtractMeta(html, @"<link\s+[^>]*rel=[""'](?:shortcut\s+)?icon[""'][^>]*href=[""']([^""']+)[""']",
                                           @"<link\s+[^>]*href=[""']([^""']+)[""'][^>]*rel=[""'](?:shortcut\s+)?icon[""']");
            if (!string.IsNullOrWhiteSpace(favicon))
            {
                metadata.Favicon = ResolveAbsoluteUrl(uri, WebUtility.HtmlDecode(favicon.Trim()));
            }

            // Extract Keywords for Suggested Tags
            var keywords = ExtractMeta(html, @"<meta\s+name=[""']keywords[""']\s+content=[""']([^""']+)[""']");
            if (!string.IsNullOrWhiteSpace(keywords))
            {
                metadata.Keywords = keywords.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .Where(k => k.Length > 1 && k.Length < 30)
                    .Take(5)
                    .ToList();
            }
        }
        catch
        {
            // Gracefully fallback to domain-derived title
        }

        return metadata;
    }

    public async Task<LinkStatusDto> CheckLinkStatusAsync(string rawUrl, int linkId = 0, CancellationToken cancellationToken = default)
    {
        var cleanUrl = NormalizeUrl(rawUrl);
        var sw = Stopwatch.StartNew();

        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(TimeSpan.FromSeconds(5));

            // First attempt lightweight HEAD request
            using var headRequest = new HttpRequestMessage(HttpMethod.Head, cleanUrl);
            var response = await HttpClient.SendAsync(headRequest, HttpCompletionOption.ResponseHeadersRead, cts.Token);

            if (response.StatusCode == HttpStatusCode.MethodNotAllowed || response.StatusCode == HttpStatusCode.NotImplemented)
            {
                // Fallback to GET
                using var getRequest = new HttpRequestMessage(HttpMethod.Get, cleanUrl);
                response = await HttpClient.SendAsync(getRequest, HttpCompletionOption.ResponseHeadersRead, cts.Token);
            }

            sw.Stop();
            var statusCode = (int)response.StatusCode;
            var isAlive = statusCode >= 200 && statusCode < 400;

            return new LinkStatusDto
            {
                LinkId = linkId,
                Url = cleanUrl,
                StatusCode = statusCode,
                IsAlive = isAlive,
                ResponseTimeMs = sw.ElapsedMilliseconds,
                StatusText = isAlive ? "Active" : $"HTTP {statusCode}"
            };
        }
        catch (Exception ex)
        {
            sw.Stop();
            return new LinkStatusDto
            {
                LinkId = linkId,
                Url = cleanUrl,
                StatusCode = 0,
                IsAlive = false,
                ResponseTimeMs = sw.ElapsedMilliseconds,
                StatusText = ex is TaskCanceledException or OperationCanceledException ? "Timeout" : "Unreachable"
            };
        }
    }

    private static string ExtractMeta(string html, params string[] patterns)
    {
        foreach (var pattern in patterns)
        {
            var match = Regex.Match(html, pattern, RegexOptions.IgnoreCase | RegexOptions.Singleline);
            if (match.Success && match.Groups.Count > 1 && !string.IsNullOrWhiteSpace(match.Groups[1].Value))
            {
                return match.Groups[1].Value;
            }
        }
        return string.Empty;
    }

    private static string NormalizeUrl(string url)
    {
        var trimmed = url.Trim();
        if (!trimmed.StartsWith("http://", StringComparison.OrdinalIgnoreCase) &&
            !trimmed.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            return "https://" + trimmed;
        }
        return trimmed;
    }

    private static string ResolveAbsoluteUrl(Uri baseUri, string relativeOrAbsolute)
    {
        if (Uri.TryCreate(relativeOrAbsolute, UriKind.Absolute, out var absUri))
        {
            return absUri.ToString();
        }

        if (Uri.TryCreate(baseUri, relativeOrAbsolute, out var combinedUri))
        {
            return combinedUri.ToString();
        }

        return relativeOrAbsolute;
    }

    private static string FormatFallbackTitle(string url, string domain)
    {
        try
        {
            var uri = new Uri(url);
            var lastSegment = uri.Segments.LastOrDefault()?.Trim('/');
            if (!string.IsNullOrWhiteSpace(lastSegment) && lastSegment.Length > 2)
            {
                var cleaned = lastSegment.Replace("-", " ").Replace("_", " ");
                if (cleaned.EndsWith(".html", StringComparison.OrdinalIgnoreCase))
                {
                    cleaned = cleaned.Substring(0, cleaned.Length - 5);
                }
                if (cleaned.Length > 60) cleaned = cleaned.Substring(0, 60) + "...";
                return char.ToUpper(cleaned[0]) + cleaned.Substring(1);
            }
        }
        catch { }

        return char.ToUpper(domain[0]) + domain.Substring(1);
    }
}
