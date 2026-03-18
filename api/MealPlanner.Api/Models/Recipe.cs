using System.ComponentModel.DataAnnotations;

namespace MealPlanner.Api.Models;

public class Recipe
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [Required] public string Name { get; set; } = string.Empty;
    [Required] public string Type { get; set; } = "manual"; // "link" or "manual"
    public string? SourceUrl { get; set; }
    public string? Description { get; set; }
    public int? Servings { get; set; }
    public int? PrepTimeMins { get; set; }
    public int? CookTimeMins { get; set; }
    public List<IngredientItem>? Ingredients { get; set; }
    public List<StepItem>? Steps { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<MealPlanSlot> MealPlanSlots { get; set; } = new List<MealPlanSlot>();
}

public class IngredientItem
{
    public string Name { get; set; } = string.Empty;
    public string? Quantity { get; set; }
    public string? Unit { get; set; }
}

public class StepItem
{
    public int Order { get; set; }
    public string Instruction { get; set; } = string.Empty;
}
