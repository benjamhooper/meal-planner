using System.ComponentModel.DataAnnotations;

namespace MealPlanner.Api.Models;

public class GroceryItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid GroceryListId { get; set; }
    [Required] public string Name { get; set; } = string.Empty;
    public string? Quantity { get; set; }
    public string? Category { get; set; }
    public bool IsChecked { get; set; } = false;
    public int SortOrder { get; set; } = 0;
    public Guid? CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public GroceryList GroceryList { get; set; } = null!;
    public User? CreatedBy { get; set; }
}
