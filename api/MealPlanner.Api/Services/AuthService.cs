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
    public async Task<bool> IsSetupAsync() =>
        await db.FamilyAuths.AnyAsync();

    public async Task SetupAsync(string password)
    {
        var hash = BCrypt.Net.BCrypt.HashPassword(password);
        db.FamilyAuths.Add(new FamilyAuth { Id = 1, PasswordHash = hash });
        await db.SaveChangesAsync();
    }

    public async Task<bool> VerifyPasswordAsync(string password)
    {
        var auth = await db.FamilyAuths.FirstOrDefaultAsync();
        if (auth == null) return false;
        return BCrypt.Net.BCrypt.Verify(password, auth.PasswordHash);
    }

    public string GenerateJwt()
    {
        var secret = config["Jwt:Secret"] ?? throw new InvalidOperationException("Jwt:Secret not configured");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: "meal-planner",
            audience: "meal-planner",
            claims: [new Claim(ClaimTypes.Name, "family")],
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
