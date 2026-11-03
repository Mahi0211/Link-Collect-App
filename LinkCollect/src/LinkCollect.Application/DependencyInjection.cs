using Microsoft.Extensions.DependencyInjection;
using LinkCollect.Application.Common.Interfaces;
using LinkCollect.Application.Services;

namespace LinkCollect.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICollectionService, CollectionService>();
        services.AddScoped<ILinkService, LinkService>();
        services.AddScoped<IFriendService, FriendService>();
        services.AddScoped<ISocialService, SocialService>();
        services.AddSingleton<IMetadataService, MetadataService>();

        return services;
    }
}
