namespace MealPlanner.Api.Models;

/// <summary>
/// Canonical user record, keyed by email. Provider-specific identities are
/// stored in <see cref="UserIdentity"/> so the same person can log in via
/// multiple OAuth providers (Google, GitHub, …) and always resolve to this
/// same account as long as the email matches.
/// </summary>
public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    /// <summary>Canonical email — used as the account-linking key.</summary>
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserIdentity> Identities { get; set; } = new List<UserIdentity>();
}
