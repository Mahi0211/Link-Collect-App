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
}
