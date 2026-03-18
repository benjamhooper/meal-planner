namespace MealPlanner.Api.Models;

public class GroceryList
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = "Grocery List";
    public Guid? CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User? CreatedBy { get; set; }
    public ICollection<GroceryItem> Items { get; set; } = new List<GroceryItem>();
}
