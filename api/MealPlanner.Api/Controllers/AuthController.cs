using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MealPlanner.Api.DTOs;
using MealPlanner.Api.Services;

namespace MealPlanner.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController(AuthService authService, IConfiguration config) : ControllerBase
{
    // ── Initiate Google OAuth ────────────────────────────────────────────────

    [HttpGet("google")]
    public IActionResult GoogleLogin()
    {
        var props = new AuthenticationProperties
        {
            RedirectUri = Url.Action(nameof(Finalize))
        };
        return Challenge(props, "Google");
    }

    // ── Initiate GitHub OAuth ────────────────────────────────────────────────

    [HttpGet("github")]
    public IActionResult GitHubLogin()
    {
        var props = new AuthenticationProperties
        {
            RedirectUri = Url.Action(nameof(Finalize))
        };
        return Challenge(props, "GitHub");
    }

    // ── Shared OAuth callback ────────────────────────────────────────────────
    // The OAuth middleware handles the provider's redirect_uri (CallbackPath),
    // then redirects here with the user signed into the "ExternalCookies" scheme.

    [HttpGet("finalize")]
    public async Task<IActionResult> Finalize()
    {
        var frontendUrl = config["FrontendUrl"] ?? "http://localhost:3000";

        var result = await HttpContext.AuthenticateAsync("ExternalCookies");
        if (!result.Succeeded)
            return Redirect($"{frontendUrl}/login?error=auth_failed");

        var claims = result.Principal!.Claims.ToList();

        var providerClaim = claims.FirstOrDefault(c => c.Type == "provider")?.Value
            ?? result.Properties?.Items[".AuthScheme"]
            ?? "unknown";

        var providerUserId = claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value;
        var email = claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value
            ?? claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Email)?.Value
            ?? string.Empty;
        var name = claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value ?? email;
        var avatarUrl = claims.FirstOrDefault(c => c.Type == "urn:google:picture")?.Value
            ?? claims.FirstOrDefault(c => c.Type == "avatarUrl")?.Value;

        var normalizedProvider = providerClaim.ToLowerInvariant();
        var user = await authService.FindOrCreateUserAsync(
            normalizedProvider, providerUserId, email, name, avatarUrl);

        var token = authService.GenerateJwt(user, normalizedProvider);

        var isProduction = HttpContext.RequestServices
            .GetRequiredService<IWebHostEnvironment>().IsProduction();

        Response.Cookies.Append("auth_token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = isProduction,
            SameSite = isProduction ? SameSiteMode.None : SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddDays(30),
            Path = "/"
        });

        await HttpContext.SignOutAsync("ExternalCookies");

        return Redirect($"{frontendUrl}/meals");
    }

    private void SetAuthCookie(string token)
    {
        var isProduction = HttpContext.RequestServices
            .GetRequiredService<IWebHostEnvironment>().IsProduction();

        Response.Cookies.Append("auth_token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = isProduction,
            SameSite = isProduction ? SameSiteMode.None : SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddDays(30),
            Path = "/"
        });
    }

    // ── Local register ───────────────────────────────────────────────────────

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name) ||
            string.IsNullOrWhiteSpace(req.Email) ||
            string.IsNullOrWhiteSpace(req.Password) ||
            req.Password.Length < 8)
            return BadRequest(new { message = "Name, email, and a password of at least 8 characters are required." });

        var result = await authService.RegisterAsync(req);
        if (result is null)
            return Conflict(new { message = "An account with that email already exists." });

        var (user, token) = result.Value;
        SetAuthCookie(token);
        return Ok(new AuthMeResponse(user.Id, user.Email, user.Name, user.AvatarUrl, "local"));
    }

    // ── Local login ──────────────────────────────────────────────────────────

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest(new { message = "Email and password are required." });

        var result = await authService.LoginAsync(req);
        if (result is null)
            return Unauthorized(new { message = "Invalid email or password." });

        var (user, token) = result.Value;
        SetAuthCookie(token);
        return Ok(new AuthMeResponse(user.Id, user.Email, user.Name, user.AvatarUrl, "local"));
    }

    // ── Logout ───────────────────────────────────────────────────────────────

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("auth_token", new CookieOptions { Path = "/" });
        return Ok(new { message = "Logged out" });
    }

    // ── Validate session + return profile ────────────────────────────────────

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var nameId = User.FindFirstValue("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")!;
        var email = User.FindFirstValue("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")!;
        var name = User.FindFirstValue(JwtRegisteredClaimNames.Name)!;
        var avatarUrl = User.FindFirstValue("avatar_url");
        var provider = User.FindFirstValue("provider")!;

        return Ok(new AuthMeResponse(Guid.Parse(nameId), email, name, avatarUrl, provider));
    }
}

