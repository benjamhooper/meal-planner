namespace MealPlanner.Api.DTOs;

public record AuthMeResponse(Guid Id, string Email, string Name, string? AvatarUrl, string Provider);
