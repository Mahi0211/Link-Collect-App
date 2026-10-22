using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using LinkCollect.Application.Common.Interfaces;
using LinkCollect.Application.DTOs.Links;
using LinkCollect.Domain.Entities;

namespace LinkCollect.Infrastructure.Data;

public class DbSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ILogger<DbSeeder> _logger;

    public DbSeeder(
        ApplicationDbContext context,
        IPasswordHasher passwordHasher,
        ILogger<DbSeeder> logger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        try
        {
            // Ensure database schema is created
            await _context.Database.EnsureCreatedAsync();

            if (await _context.Users.AnyAsync())
            {
                _logger.LogInformation("Database already contains users. Skipping initial seed.");
                return;
            }

            _logger.LogInformation("Starting database seeding from sample-data.json...");

            // Find sample-data.json path
            var possiblePaths = new[]
            {
                Path.Combine(AppContext.BaseDirectory, "sample-data.json"),
                Path.Combine(Directory.GetCurrentDirectory(), "sample-data.json"),
                Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "my-react-app", "src", "sample-data.json"),
                Path.Combine(Directory.GetCurrentDirectory(), "..", "my-react-app", "src", "sample-data.json"),
                @"d:\FBNation\LinkCollect\my-react-app\src\sample-data.json"
            };

            string? sampleDataPath = possiblePaths.FirstOrDefault(File.Exists);

            string email = "becauseiamkira1986@gmail.com";
            string username = "becauseiamkira1986";
            string name = "Shinigami's Apple";
            string password = "Mahin@99";
            SeedUserImportDto? seedUser = null;

            if (sampleDataPath != null)
            {
                var json = await File.ReadAllTextAsync(sampleDataPath);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                seedUser = JsonSerializer.Deserialize<SeedUserImportDto>(json, options);
                if (seedUser != null)
                {
                    if (!string.IsNullOrWhiteSpace(seedUser.Email)) email = seedUser.Email;
                    if (!string.IsNullOrWhiteSpace(seedUser.Username)) username = seedUser.Username;
                    if (!string.IsNullOrWhiteSpace(seedUser.Name)) name = seedUser.Name;
                    if (!string.IsNullOrWhiteSpace(seedUser.Password)) password = seedUser.Password;
                }
            }

            var user = new User
            {
                Email = email.ToLowerInvariant(),
                Username = username,
                Name = name,
                PasswordHash = _passwordHasher.HashPassword(password),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            if (seedUser?.Collections != null && seedUser.Collections.Count > 0)
            {
                int totalLinksAdded = 0;
                foreach (var colDto in seedUser.Collections)
                {
                    if (string.IsNullOrWhiteSpace(colDto.CollectionName)) continue;

                    var col = new Collection
                    {
                        UserId = user.Id,
                        Name = colDto.CollectionName.Trim(),
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Collections.Add(col);
                    await _context.SaveChangesAsync();

                    foreach (var rawUrl in colDto.Links)
                    {
                        if (string.IsNullOrWhiteSpace(rawUrl)) continue;
                        var url = rawUrl.Trim();
                        var domain = ExtractDomain(url);
                        var title = GetFallbackTitle(url, domain);

                        var linkItem = new LinkItem
                        {
                            UserId = user.Id,
                            CollectionId = col.Id,
                            Url = url,
                            Title = title,
                            Domain = domain,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        _context.Links.Add(linkItem);
                        totalLinksAdded++;
                    }
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("Database seeded successfully with {Count} collections and {Links} links.",
                    seedUser.Collections.Count, totalLinksAdded);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database.");
        }
    }

    private static string ExtractDomain(string url)
    {
        try
        {
            var uri = new Uri(url);
            return uri.Host.Replace("www.", "");
        }
        catch
        {
            return "link";
        }
    }

    private static string GetFallbackTitle(string url, string domain)
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

        return $"{domain} resource";
    }
}
