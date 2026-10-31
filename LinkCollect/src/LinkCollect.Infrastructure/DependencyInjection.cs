using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using LinkCollect.Application.Common.Interfaces;
using LinkCollect.Infrastructure.Data;
using LinkCollect.Infrastructure.Services;

namespace LinkCollect.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        string? connectionString = null;

        var cloudUrl = Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? Environment.GetEnvironmentVariable("MYSQL_URL")
            ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");

        if (!string.IsNullOrWhiteSpace(cloudUrl))
        {
            var trimmed = cloudUrl.Trim();
            if (trimmed.StartsWith("mysql://", StringComparison.OrdinalIgnoreCase) ||
                trimmed.StartsWith("mysqls://", StringComparison.OrdinalIgnoreCase))
            {
                connectionString = ParseMySqlUrl(trimmed);
            }
            else if (trimmed.Contains("Server=", StringComparison.OrdinalIgnoreCase) ||
                     trimmed.Contains("Data Source=", StringComparison.OrdinalIgnoreCase) ||
                     trimmed.Contains("Database=", StringComparison.OrdinalIgnoreCase))
            {
                connectionString = trimmed;
            }
        }

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            connectionString = "Server=localhost;Database=linkcollect_db;User=root;Password=Mahin@99;";
        }

        // Safeguard: Ensure a valid application database (defaulting to 'test') is always specified.
        // If Database is missing or set to 'sys', MySQL queries will fail against the internal system schema.
        if (!connectionString.Contains("Database=", StringComparison.OrdinalIgnoreCase))
        {
            connectionString = connectionString.TrimEnd(';') + ";Database=test;";
        }
        else
        {
            connectionString = System.Text.RegularExpressions.Regex.Replace(
                connectionString,
                @"Database\s*=\s*(sys|mysql|information_schema|performance_schema)\b",
                "Database=test",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase
            );
        }

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseMySql(
                connectionString,
                new MySqlServerVersion(new Version(8, 0, 40)),
                mySqlOptions => mySqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 3,
                    maxRetryDelay: TimeSpan.FromSeconds(5),
                    errorNumbersToAdd: null
                )
            );
        });

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<DbSeeder>();

        return services;
    }

    private static string ParseMySqlUrl(string mysqlUrl)
    {
        try
        {
            var uri = new Uri(mysqlUrl);
            var userInfo = uri.UserInfo.Split(':');
            var user = Uri.UnescapeDataString(userInfo[0]);
            var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
            var host = uri.Host;
            var port = uri.Port > 0 ? uri.Port : 3306;
            var path = uri.AbsolutePath.TrimStart('/');
            var database = path.Contains('?') ? path.Split('?')[0] : path;
            if (string.IsNullOrWhiteSpace(database) || 
                database.Equals("sys", StringComparison.OrdinalIgnoreCase) ||
                database.Equals("mysql", StringComparison.OrdinalIgnoreCase))
            {
                database = "test";
            }
            var sslMode = mysqlUrl.Contains("ssl-mode=REQUIRED", StringComparison.OrdinalIgnoreCase)
                ? "Required"
                : "Preferred";
            return $"Server={host};Port={port};Database={database};User={user};Password={password};SslMode={sslMode};AllowPublicKeyRetrieval=True;";
        }
        catch
        {
            return mysqlUrl;
        }
    }
}
