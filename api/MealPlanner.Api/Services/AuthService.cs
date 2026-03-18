using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MealPlanner.Api.Data;
using MealPlanner.Api.Models;

namespace MealPlanner.Api.Services;

public class AuthService(AppDbContext db, IConfiguration config)
{
    /// <summary>
    /// Resolves the canonical <see cref="User"/> for an OAuth sign-in using
    /// the following priority order:
    /// <list type="number">
    ///   <item>Exact match on (provider, providerUserId) — fastest path.</item>
    ///   <item>Email match — links a second provider to an existing account.</item>
    ///   <item>No match — creates a new user and a new identity row.</item>
    /// </list>
    /// Profile fields (name, avatarUrl) are refreshed from the provider on
    /// every successful login.
    /// </summary>
    public async Task<User> FindOrCreateUserAsync(
        string provider, string providerUserId, string email, string name, string? avatarUrl)
    {
        // 1. Exact provider identity match
        var identity = await db.UserIdentities
            .Include(i => i.User)
            .FirstOrDefaultAsync(i => i.Provider == provider && i.ProviderUserId == providerUserId);

        User user;

        if (identity is not null)
        {
            // Known identity — just refresh the canonical profile
            user = identity.User;
        }
        else
        {
            // 2. Same email, different provider — link to existing account
            user = await db.Users
                .FirstOrDefaultAsync(u => u.Email == email)
                ?? new User { Email = email };

            if (user.Id == Guid.Empty)
            {
                // 3. Brand-new user
                db.Users.Add(user);
            }

            // Add the new provider identity and link it
            db.UserIdentities.Add(new UserIdentity
            {
                Provider = provider,
                ProviderUserId = providerUserId,
                UserId = user.Id   // EF will fix up the FK after SaveChanges
            });
        }

        // Refresh profile on every login
        user.Name = name;
        if (avatarUrl is not null) user.AvatarUrl = avatarUrl;
        user.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return user;
    }

    /// <param name="provider">The provider that was used for this specific login (e.g. "google").</param>
    public string GenerateJwt(User user, string provider)
    {
        var secret = config["Jwt:Secret"] ?? throw new InvalidOperationException("Jwt:Secret not configured");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        Claim[] claims =
        [
            new("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier", user.Id.ToString()),
            new("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress", user.Email),
            new(JwtRegisteredClaimNames.Name, user.Name),
            new("provider", provider),
            new("avatar_url", user.AvatarUrl ?? string.Empty)
        ];

        var token = new JwtSecurityToken(
            issuer: "meal-planner",
            audience: "meal-planner",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public static Guid GetCurrentUserId(ClaimsPrincipal principal)
    {
        var nameIdentifier = principal.FindFirstValue("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")
            ?? throw new InvalidOperationException("NameIdentifier claim missing");
        return Guid.Parse(nameIdentifier);
    }
}
