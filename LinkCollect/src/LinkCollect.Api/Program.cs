using System.Text;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using LinkCollect.Application;
using LinkCollect.Infrastructure;
using LinkCollect.Infrastructure.Data;
using LinkCollect.Api.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Bind to Render dynamic PORT if present
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

// Add Application & Infrastructure Layers
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Add Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure JWT Authentication
var jwtSecret = builder.Configuration["Jwt:SecretKey"] ?? "LinkCollectSuperSecureDevelopmentKey2026!@#$%^&*()_+UniqueKey";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "LinkCollectApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "LinkCollectFrontend";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Modern OpenAPI documentation
builder.Services.AddOpenApi();

var app = builder.Build();

// Automatically seed database schema and initial data
using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<DbSeeder>();
    await seeder.SeedAsync();
}

// HTTP request pipeline
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

app.MapOpenApi();
app.MapScalarApiReference(options =>
{
    options.WithTitle("LinkCollect API Reference");
    options.WithTheme(ScalarTheme.Moon);
});

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Serve production frontend assets (React SPA)
var possibleDistPaths = new[]
{
    Path.GetFullPath(Path.Combine(app.Environment.ContentRootPath, "..", "..", "..", "my-react-app", "dist")),
    Path.GetFullPath(Path.Combine(app.Environment.ContentRootPath, "..", "..", "my-react-app", "dist")),
    Path.GetFullPath(Path.Combine(app.Environment.ContentRootPath, "wwwroot")),
    @"d:\FBNation\LinkCollect\my-react-app\dist"
};

var clientDistPath = possibleDistPaths.FirstOrDefault(Directory.Exists);

if (Directory.Exists(clientDistPath))
{
    var fileProvider = new PhysicalFileProvider(clientDistPath);
    app.UseDefaultFiles(new DefaultFilesOptions
    {
        FileProvider = fileProvider
    });
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = fileProvider
    });
    app.MapFallbackToFile("index.html", new StaticFileOptions
    {
        FileProvider = fileProvider
    });
}

app.Run();

public partial class Program { }
