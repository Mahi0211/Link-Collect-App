using Microsoft.EntityFrameworkCore;
using LinkCollect.Application.Common.Exceptions;
using LinkCollect.Application.Common.Interfaces;
using LinkCollect.Application.DTOs.Auth;
using LinkCollect.Application.DTOs.Collections;
using LinkCollect.Application.Services;
using LinkCollect.Domain.Entities;
using LinkCollect.Infrastructure.Data;

namespace LinkCollect.UnitTests;

// Mock PasswordHasher
public class FakePasswordHasher : IPasswordHasher
{
    public string HashPassword(string password) => $"hashed_{password}";
    public bool VerifyPassword(string password, string passwordHash) => passwordHash == $"hashed_{password}";
}

// Mock TokenService
public class FakeTokenService : ITokenService
{
    public string GenerateJwtToken(User user) => $"fake_jwt_token_for_{user.Username}";
}

public class AuthServiceTests
{
    private ApplicationDbContext CreateDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task RegisterAsync_ValidRequest_CreatesUserAndReturnsToken()
    {
        // Arrange
        using var context = CreateDbContext(nameof(RegisterAsync_ValidRequest_CreatesUserAndReturnsToken));
        var hasher = new FakePasswordHasher();
        var tokenService = new FakeTokenService();
        var authService = new AuthService(context, hasher, tokenService);

        var request = new RegisterRequestDto
        {
            Email = "test@example.com",
            Username = "testuser",
            Name = "Test User",
            Password = "Password123"
        };

        // Act
        var result = await authService.RegisterAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("test@example.com", result.User.Email);
        Assert.Equal("testuser", result.User.Username);
        Assert.StartsWith("fake_jwt_token", result.Token);

        var savedUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "test@example.com");
        Assert.NotNull(savedUser);
        Assert.Equal("hashed_Password123", savedUser.PasswordHash);
    }

    [Fact]
    public async Task RegisterAsync_DuplicateEmail_ThrowsBadRequestException()
    {
        // Arrange
        using var context = CreateDbContext(nameof(RegisterAsync_DuplicateEmail_ThrowsBadRequestException));
        var hasher = new FakePasswordHasher();
        var tokenService = new FakeTokenService();
        var authService = new AuthService(context, hasher, tokenService);

        context.Users.Add(new User
        {
            Email = "duplicate@example.com",
            Username = "user1",
            PasswordHash = "hash"
        });
        await context.SaveChangesAsync();

        var request = new RegisterRequestDto
        {
            Email = "duplicate@example.com",
            Username = "user2",
            Password = "Password123"
        };

        // Act & Assert
        await Assert.ThrowsAsync<BadRequestException>(() => authService.RegisterAsync(request));
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsToken()
    {
        // Arrange
        using var context = CreateDbContext(nameof(LoginAsync_ValidCredentials_ReturnsToken));
        var hasher = new FakePasswordHasher();
        var tokenService = new FakeTokenService();
        var authService = new AuthService(context, hasher, tokenService);

        context.Users.Add(new User
        {
            Email = "login@example.com",
            Username = "loginuser",
            PasswordHash = hasher.HashPassword("MySecretPass")
        });
        await context.SaveChangesAsync();

        var request = new LoginRequestDto
        {
            Identifier = "login@example.com",
            Password = "MySecretPass"
        };

        // Act
        var result = await authService.LoginAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("loginuser", result.User.Username);
        Assert.NotEmpty(result.Token);
    }

    [Fact]
    public async Task LoginAsync_InvalidPassword_ThrowsUnauthorizedException()
    {
        // Arrange
        using var context = CreateDbContext(nameof(LoginAsync_InvalidPassword_ThrowsUnauthorizedException));
        var hasher = new FakePasswordHasher();
        var tokenService = new FakeTokenService();
        var authService = new AuthService(context, hasher, tokenService);

        context.Users.Add(new User
        {
            Email = "login@example.com",
            Username = "loginuser",
            PasswordHash = hasher.HashPassword("CorrectPass")
        });
        await context.SaveChangesAsync();

        var request = new LoginRequestDto
        {
            Identifier = "login@example.com",
            Password = "WrongPassword"
        };

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedException>(() => authService.LoginAsync(request));
    }
}

public class CollectionServiceTests
{
    private ApplicationDbContext CreateDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task CreateCollectionAsync_ValidName_CreatesSuccessfully()
    {
        // Arrange
        using var context = CreateDbContext(nameof(CreateCollectionAsync_ValidName_CreatesSuccessfully));
        var service = new CollectionService(context);

        var request = new CreateCollectionDto { CollectionName = "Dev Articles" };

        // Act
        var result = await service.CreateCollectionAsync(1, request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Dev Articles", result.CollectionName);
        Assert.Equal(0, result.TotalLinks);

        var inDb = await context.Collections.FirstOrDefaultAsync(c => c.Name == "Dev Articles" && c.UserId == 1);
        Assert.NotNull(inDb);
    }

    [Fact]
    public async Task CreateCollectionAsync_DuplicateName_ThrowsBadRequestException()
    {
        // Arrange
        using var context = CreateDbContext(nameof(CreateCollectionAsync_DuplicateName_ThrowsBadRequestException));
        var service = new CollectionService(context);

        context.Collections.Add(new Collection { UserId = 1, Name = "Existing" });
        await context.SaveChangesAsync();

        var request = new CreateCollectionDto { CollectionName = "Existing" };

        // Act & Assert
        await Assert.ThrowsAsync<BadRequestException>(() => service.CreateCollectionAsync(1, request));
    }
}
