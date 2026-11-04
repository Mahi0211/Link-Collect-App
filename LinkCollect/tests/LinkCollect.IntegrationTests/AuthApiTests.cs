using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using LinkCollect.Application.DTOs.Auth;

namespace LinkCollect.IntegrationTests;

public class AuthApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public AuthApiTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Login_WithValidSeededUser_Returns200AndToken()
    {
        // Arrange
        var payload = new LoginRequestDto
        {
            Identifier = "becauseiamkira1986@gmail.com",
            Password = "Mahin@99"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", payload);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        Assert.NotNull(authResponse);
        Assert.NotEmpty(authResponse.Token);
        Assert.Equal("becauseiamkira1986@gmail.com", authResponse.User.Email);
    }

    [Fact]
    public async Task Login_WithWrongPassword_Returns401Unauthorized()
    {
        // Arrange
        var payload = new LoginRequestDto
        {
            Identifier = "becauseiamkira1986@gmail.com",
            Password = "IncorrectPassword123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", payload);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetCollections_WithoutAuthHeader_Returns401Unauthorized()
    {
        // Act
        var response = await _client.GetAsync("/api/collections");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithDemoUserEmail_Returns200AndValidToken()
    {
        // Arrange
        var payload = new LoginRequestDto
        {
            Identifier = "lionelmahi9@gmail.com",
            Password = "Mahin@99"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", payload);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        Assert.NotNull(authResponse);
        Assert.NotEmpty(authResponse.Token);
        Assert.Equal("lionelmahi9@gmail.com", authResponse.User.Email);
        Assert.Equal("Lionel Mahi", authResponse.User.Username);
    }

    [Fact]
    public async Task Login_WithDemoUserName_Returns200AndValidToken()
    {
        // Arrange
        var payload = new LoginRequestDto
        {
            Identifier = "Lionel Mahi",
            Password = "Mahin@99"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", payload);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        Assert.NotNull(authResponse);
        Assert.Equal("lionelmahi9@gmail.com", authResponse.User.Email);
    }

    [Fact]
    public async Task Login_WithDemoUserNormalized_Returns200AndValidToken()
    {
        // Arrange
        var payload = new LoginRequestDto
        {
            Identifier = "lionelmahi",
            Password = "Mahin@99"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", payload);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        Assert.NotNull(authResponse);
        Assert.Equal("lionelmahi9@gmail.com", authResponse.User.Email);
    }

    [Fact]
    public async Task NewUser_CanAddCollectionsAndLinks_StoredWithNewUserId()
    {
        // 1. Login as Lionel Mahi
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequestDto
        {
            Identifier = "lionelmahi9@gmail.com",
            Password = "Mahin@99"
        });
        var authData = await loginResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
        Assert.NotNull(authData);

        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", authData.Token);

        // 2. Create a collection
        var colResponse = await client.PostAsJsonAsync("/api/collections", new LinkCollect.Application.DTOs.Collections.CreateCollectionDto
        {
            CollectionName = "My Work Resources"
        });
        Assert.Equal(HttpStatusCode.Created, colResponse.StatusCode);

        // 3. Create a link
        var linkResponse = await client.PostAsJsonAsync("/api/links", new LinkCollect.Application.DTOs.Links.CreateLinkDto
        {
            Url = "https://github.com",
            Title = "GitHub Official",
            CollectionName = "My Work Resources"
        });
        Assert.Equal(HttpStatusCode.Created, linkResponse.StatusCode);

        var createdLink = await linkResponse.Content.ReadFromJsonAsync<LinkCollect.Application.DTOs.Links.LinkDto>();
        Assert.NotNull(createdLink);
        Assert.Equal("https://github.com", createdLink.Url);
        Assert.Equal("My Work Resources", createdLink.CollectionName);

        // 4. Fetch links for Lionel Mahi
        var getLinksResponse = await client.GetAsync("/api/links");
        Assert.Equal(HttpStatusCode.OK, getLinksResponse.StatusCode);

        var linksList = await getLinksResponse.Content.ReadFromJsonAsync<List<LinkCollect.Application.DTOs.Links.LinkDto>>();
        Assert.NotNull(linksList);
        Assert.Contains(linksList, l => l.Url == "https://github.com");

        // 5. Clean up the test link and collection
        if (createdLink.Id > 0)
        {
            await client.DeleteAsync($"/api/links/{createdLink.Id}");
        }
        if (createdLink.CollectionId.HasValue)
        {
            await client.DeleteAsync($"/api/collections/{createdLink.CollectionId.Value}");
        }
    }

    [Fact]
    public async Task Register_WithFullNameAndEmail_SucceedsAndGeneratesUsername()
    {
        // Arrange: Generate unique test email
        var randomId = Guid.NewGuid().ToString("N")[..8];
        var payload = new RegisterRequestDto
        {
            Name = "Alex Morgan",
            Email = $"alex_{randomId}@example.com",
            Password = "SecurePassword2026!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", payload);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var authResponse = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        Assert.NotNull(authResponse);
        Assert.NotEmpty(authResponse.Token);
        Assert.Equal($"alex_{randomId}@example.com", authResponse.User.Email);
        Assert.Equal("Alex Morgan", authResponse.User.Name);
        Assert.StartsWith("alexmorgan", authResponse.User.Username);
    }

    [Fact]
    public async Task Register_WithWeakPassword_Returns400BadRequest()
    {
        // Arrange
        var payload = new RegisterRequestDto
        {
            Name = "Weak User",
            Email = $"weak_{Guid.NewGuid():N}@example.com",
            Password = "weak" // Under 8 chars
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", payload);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_Returns400BadRequest()
    {
        // Arrange: Try to register with already existing seeded email
        var payload = new RegisterRequestDto
        {
            Name = "Duplicate User",
            Email = "becauseiamkira1986@gmail.com",
            Password = "ValidPassword2026!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", payload);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetProfile_Authenticated_Returns200AndUserProfile()
    {
        // 1. Login as Lionel Mahi
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequestDto
        {
            Identifier = "lionelmahi9@gmail.com",
            Password = "Mahin@99"
        });
        var authData = await loginResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
        Assert.NotNull(authData);

        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", authData.Token);

        // 2. Fetch profile
        var profileResponse = await client.GetAsync("/api/auth/profile");
        Assert.Equal(HttpStatusCode.OK, profileResponse.StatusCode);

        var profile = await profileResponse.Content.ReadFromJsonAsync<UserDto>();
        Assert.NotNull(profile);
        Assert.Equal("lionelmahi9@gmail.com", profile.Email);
    }

    [Fact]
    public async Task UpdateProfile_ValidPayload_UpdatesUserSuccessfully()
    {
        // 1. Login as Lionel Mahi
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequestDto
        {
            Identifier = "lionelmahi9@gmail.com",
            Password = "Mahin@99"
        });
        var authData = await loginResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
        Assert.NotNull(authData);

        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", authData.Token);

        // 2. Update profile
        var updatePayload = new UpdateUserProfileDto
        {
            Name = "Alex Kira Morgan",
            RoleTitle = "Staff Product Designer & Curation Lead",
            Location = "San Francisco, CA (UTC-7)",
            Bio = "Curating the web's best design systems, retro apparel, and frontend tools.",
            AvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
            SocialLinksJson = "[{\"platform\":\"x\",\"handle\":\"alexkiradev\",\"url\":\"https://x.com/alexkiradev\"}]"
        };

        var updateResponse = await client.PutAsJsonAsync("/api/auth/profile", updatePayload);
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        var updatedUser = await updateResponse.Content.ReadFromJsonAsync<UserDto>();
        Assert.NotNull(updatedUser);
        Assert.Equal("Alex Kira Morgan", updatedUser.Name);
        Assert.Equal("Staff Product Designer & Curation Lead", updatedUser.RoleTitle);
        Assert.Equal("San Francisco, CA (UTC-7)", updatedUser.Location);
        Assert.Equal("Curating the web's best design systems, retro apparel, and frontend tools.", updatedUser.Bio);
        Assert.NotEmpty(updatedUser.SocialLinksJson ?? "");
    }

    [Fact]
    public async Task CheckUsername_ExistingAndAvailable_ReturnsCorrectStatus()
    {
        // 1. Existing username check
        var existingResponse = await _client.GetAsync("/api/auth/check-username?username=becauseiamkira1986");
        Assert.Equal(HttpStatusCode.OK, existingResponse.StatusCode);
        var existingResult = await existingResponse.Content.ReadFromJsonAsync<UsernameCheckResult>();
        Assert.NotNull(existingResult);
        Assert.False(existingResult.Available);

        // 2. Available unique username check
        var uniqueUsername = $"unique_user_{Guid.NewGuid():N}";
        var availableResponse = await _client.GetAsync($"/api/auth/check-username?username={uniqueUsername}");
        Assert.Equal(HttpStatusCode.OK, availableResponse.StatusCode);
        var availableResult = await availableResponse.Content.ReadFromJsonAsync<UsernameCheckResult>();
        Assert.NotNull(availableResult);
        Assert.True(availableResult.Available);
    }
}

public class UsernameCheckResult
{
    public bool Available { get; set; }
    public string Username { get; set; } = string.Empty;
}
