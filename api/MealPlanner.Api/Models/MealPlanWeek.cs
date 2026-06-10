using System.ComponentModel.DataAnnotations;

namespace MealPlanner.Api.Models;

public class MealPlanWeek
{
    public Guid Id { get; set; } = Guid.NewGuid();
    [Required] public DateOnly WeekStartDate { get; set; }
    public Guid? UserId { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public ICollection<MealPlanSlot> Slots { get; set; } = new List<MealPlanSlot>();
}
