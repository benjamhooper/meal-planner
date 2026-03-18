namespace MealPlanner.Api.DTOs;

public record GroceryListResponse(Guid Id, string Name, int ItemCount, DateTime UpdatedAt);

public record GroceryItemResponse(
    Guid Id, Guid GroceryListId, string Name,
    string? Quantity, string? Category,
    bool IsChecked, int SortOrder, DateTime UpdatedAt);

public record AddGroceryItemRequest(
    string Name, string? Quantity, string? Category);

public record PatchGroceryItemRequest(
    string? Name, string? Quantity, string? Category,
    bool? IsChecked, int? SortOrder);

public record ReorderRequest(List<ReorderItem> Items);
public record ReorderItem(Guid Id, int SortOrder);
