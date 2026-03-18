using MealPlanner.Api.Models;

namespace MealPlanner.Api.DTOs;

public record RecipeListItem(
    Guid Id, string Name, string Type,
    string? SourceUrl, string? Description,
    int? Servings, int? PrepTimeMins, int? CookTimeMins,
    string? ImageUrl, DateTime CreatedAt);

public record RecipeDetail(
    Guid Id, string Name, string Type,
    string? SourceUrl, string? Description,
    int? Servings, int? PrepTimeMins, int? CookTimeMins,
    List<IngredientItem>? Ingredients, List<StepItem>? Steps,
    string? ImageUrl, DateTime CreatedAt, DateTime UpdatedAt);

public record CreateRecipeRequest(
    string Name, string Type,
    string? SourceUrl, string? Description,
    int? Servings, int? PrepTimeMins, int? CookTimeMins,
    List<IngredientItem>? Ingredients, List<StepItem>? Steps,
    string? ImageUrl);

public record UpdateRecipeRequest(
    string Name, string Type,
    string? SourceUrl, string? Description,
    int? Servings, int? PrepTimeMins, int? CookTimeMins,
    List<IngredientItem>? Ingredients, List<StepItem>? Steps,
    string? ImageUrl);

public record PagedResult<T>(List<T> Items, int TotalCount, int Page, int PageSize);
