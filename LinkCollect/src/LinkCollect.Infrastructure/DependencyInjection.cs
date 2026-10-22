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
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        var cloudUrl = Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? Environment.GetEnvironmentVariable("MYSQL_URL");

        if (!string.IsNullOrWhiteSpace(cloudUrl) && cloudUrl.StartsWith("mysql://", StringComparison.OrdinalIgnoreCase))
        {
            connectionString = ParseMySqlUrl(cloudUrl);
        }

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            connectionString = "Server=localhost;Database=linkcollect_db;User=root;Password=Mahin@99;";
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
            var database = uri.AbsolutePath.TrimStart('/');
            return $"Server={host};Port={port};Database={database};User={user};Password={password};SslMode=Preferred;";
        }
        catch
        {
            return mysqlUrl;
        }
    }
}
