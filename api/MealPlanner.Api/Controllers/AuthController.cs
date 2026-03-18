using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MealPlanner.Api.DTOs;
using MealPlanner.Api.Services;

namespace MealPlanner.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("setup")]
    public async Task<IActionResult> Setup([FromBody] SetupRequest req)
    {
        if (await authService.IsSetupAsync())
            return Conflict(new { message = "Already configured" });
        await authService.SetupAsync(req.Password);
        return Ok(new { message = "Setup complete" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        if (!await authService.VerifyPasswordAsync(req.Password))
            return Unauthorized(new { message = "Invalid password" });

        var token = authService.GenerateJwt();
        var isProduction = HttpContext.RequestServices
            .GetRequiredService<IWebHostEnvironment>().IsProduction();

        Response.Cookies.Append("auth_token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = isProduction,
            SameSite = isProduction ? SameSiteMode.None : SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(30),
            Path = "/"
        });

        return Ok(new { message = "Logged in" });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("auth_token", new CookieOptions { Path = "/" });
        return Ok(new { message = "Logged out" });
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me() => Ok(new AuthMeResponse(true));
}
