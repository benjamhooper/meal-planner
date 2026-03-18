using System.ComponentModel.DataAnnotations;

namespace MealPlanner.Api.DTOs;

public record LoginRequest([Required] string Password);
public record SetupRequest([Required] string Password);
public record AuthMeResponse(bool Authenticated);
