namespace MealPlanner.Api.Models;

/// <summary>
/// Represents a single OAuth provider identity linked to a canonical User.
/// A user may have multiple identities (e.g. one for Google, one for GitHub)
/// if they log in with different providers that share the same email address.
/// </summary>
public class UserIdentity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    /// <summary>e.g. "google" or "github"</summary>
    public string Provider { get; set; } = string.Empty;
    /// <summary>The opaque user ID returned by the provider.</summary>
    public string ProviderUserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}
