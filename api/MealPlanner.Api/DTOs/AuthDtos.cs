namespace MealPlanner.Api.DTOs;

public record AuthMeResponse(Guid Id, string Email, string Name, string? AvatarUrl, string Provider);

public record RegisterRequest(string Name, string Email, string Password);

public record LoginRequest(string Email, string Password);
