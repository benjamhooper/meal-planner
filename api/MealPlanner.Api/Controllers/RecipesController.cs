using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MealPlanner.Api.Data;
using MealPlanner.Api.DTOs;
using MealPlanner.Api.Models;
using MealPlanner.Api.Services;

namespace MealPlanner.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/recipes")]
public class RecipesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<RecipeListItem>>> GetAll(
        [FromQuery] string? type,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = db.Recipes.Include(r => r.CreatedBy).AsQueryable();
        if (!string.IsNullOrWhiteSpace(type)) query = query.Where(r => r.Type == type);
        if (!string.IsNullOrWhiteSpace(search)) query = query.Where(r => r.Name.ToLower().Contains(search.ToLower()));

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(r => r.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new RecipeListItem(r.Id, r.Name, r.Type, r.SourceUrl, r.Description,
                r.Servings, r.PrepTimeMins, r.CookTimeMins, r.ImageUrl, r.CreatedAt,
                r.CreatedByUserId, r.CreatedBy != null ? r.CreatedBy.Name : null))
            .ToListAsync();

        return Ok(new PagedResult<RecipeListItem>(items, total, page, pageSize));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<RecipeDetail>> GetById(Guid id)
    {
        var r = await db.Recipes.Include(r => r.CreatedBy).FirstOrDefaultAsync(r => r.Id == id);
        if (r == null) return NotFound();
        return Ok(new RecipeDetail(r.Id, r.Name, r.Type, r.SourceUrl, r.Description,
            r.Servings, r.PrepTimeMins, r.CookTimeMins, r.Ingredients, r.Steps,
            r.ImageUrl, r.CreatedAt, r.UpdatedAt,
            r.CreatedByUserId, r.CreatedBy?.Name));
    }

    [HttpPost]
    public async Task<ActionResult<RecipeDetail>> Create([FromBody] CreateRecipeRequest req)
    {
        var userId = AuthService.GetCurrentUserId(User);
        var recipe = new Recipe
        {
            Name = req.Name, Type = req.Type, SourceUrl = req.SourceUrl,
            Description = req.Description, Servings = req.Servings,
            PrepTimeMins = req.PrepTimeMins, CookTimeMins = req.CookTimeMins,
            Ingredients = req.Ingredients, Steps = req.Steps, ImageUrl = req.ImageUrl,
            CreatedByUserId = userId
        };
        db.Recipes.Add(recipe);
        await db.SaveChangesAsync();
        await db.Entry(recipe).Reference(r => r.CreatedBy).LoadAsync();
        return CreatedAtAction(nameof(GetById), new { id = recipe.Id },
            new RecipeDetail(recipe.Id, recipe.Name, recipe.Type, recipe.SourceUrl, recipe.Description,
                recipe.Servings, recipe.PrepTimeMins, recipe.CookTimeMins, recipe.Ingredients,
                recipe.Steps, recipe.ImageUrl, recipe.CreatedAt, recipe.UpdatedAt,
                recipe.CreatedByUserId, recipe.CreatedBy?.Name));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<RecipeDetail>> Update(Guid id, [FromBody] UpdateRecipeRequest req)
    {
        var recipe = await db.Recipes.Include(r => r.CreatedBy).FirstOrDefaultAsync(r => r.Id == id);
        if (recipe == null) return NotFound();
        recipe.Name = req.Name; recipe.Type = req.Type; recipe.SourceUrl = req.SourceUrl;
        recipe.Description = req.Description; recipe.Servings = req.Servings;
        recipe.PrepTimeMins = req.PrepTimeMins; recipe.CookTimeMins = req.CookTimeMins;
        recipe.Ingredients = req.Ingredients; recipe.Steps = req.Steps;
        recipe.ImageUrl = req.ImageUrl; recipe.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Ok(new RecipeDetail(recipe.Id, recipe.Name, recipe.Type, recipe.SourceUrl, recipe.Description,
            recipe.Servings, recipe.PrepTimeMins, recipe.CookTimeMins, recipe.Ingredients,
            recipe.Steps, recipe.ImageUrl, recipe.CreatedAt, recipe.UpdatedAt,
            recipe.CreatedByUserId, recipe.CreatedBy?.Name));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var recipe = await db.Recipes.FindAsync(id);
        if (recipe == null) return NotFound();
        db.Recipes.Remove(recipe);
        await db.SaveChangesAsync();
        return NoContent();
    }
}

