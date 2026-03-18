namespace MealPlanner.Api.Models;

public class MealPlanSlot
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid MealPlanWeekId { get; set; }
    public short DayOfWeek { get; set; } // 0=Mon...6=Sun
    public string MealType { get; set; } = string.Empty; // breakfast/lunch/dinner
    public Guid? RecipeId { get; set; }
    public string? CustomLabel { get; set; }
    public string? Notes { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public MealPlanWeek Week { get; set; } = null!;
    public Recipe? Recipe { get; set; }
    public User? CreatedBy { get; set; }
}
