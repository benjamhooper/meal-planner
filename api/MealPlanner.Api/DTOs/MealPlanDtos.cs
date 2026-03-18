namespace MealPlanner.Api.DTOs;

public record MealPlanWeekResponse(
    Guid Id, DateOnly WeekStartDate, string? Notes,
    List<MealPlanSlotResponse> Slots);

public record MealPlanSlotResponse(
    Guid Id, Guid MealPlanWeekId, short DayOfWeek, string MealType,
    Guid? RecipeId, string? RecipeName, string? RecipeType,
    string? CustomLabel, string? Notes);

public record CreateSlotRequest(
    DateOnly WeekStartDate, short DayOfWeek, string MealType,
    Guid? RecipeId, string? CustomLabel, string? Notes);

public record UpdateSlotRequest(
    Guid? RecipeId, string? CustomLabel, string? Notes);
