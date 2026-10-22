using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using LinkCollect.Application.DTOs.Auth;

namespace LinkCollect.IntegrationTests;

public class AuthApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public AuthApiTests(WebApplicationFactory<Program> factory)
    {
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
}
