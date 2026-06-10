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
[Route("api/v1/grocery")]
public class GroceryController(AppDbContext db) : ControllerBase
{
    [HttpGet("lists")]
    public async Task<ActionResult<List<GroceryListResponse>>> GetLists()
    {
        var userId = AuthService.GetCurrentUserId(User);
        var lists = await db.GroceryLists
            .Where(l => l.CreatedByUserId == userId)
            .Select(l => new GroceryListResponse(l.Id, l.Name, l.Items.Count, l.UpdatedAt))
            .ToListAsync();

        if (lists.Count == 0)
        {
            var newList = new GroceryList { Name = "Grocery List", CreatedByUserId = userId };
            db.GroceryLists.Add(newList);
            await db.SaveChangesAsync();
            lists.Add(new GroceryListResponse(newList.Id, newList.Name, 0, newList.UpdatedAt));
        }

        return Ok(lists);
    }

    [HttpGet("lists/{id:guid}/items")]
    public async Task<ActionResult<List<GroceryItemResponse>>> GetItems(Guid id)
    {
        var userId = AuthService.GetCurrentUserId(User);
        var list = await db.GroceryLists.FirstOrDefaultAsync(l => l.Id == id && l.CreatedByUserId == userId);
        if (list == null) return NotFound();
        var items = await db.GroceryItems
            .Where(i => i.GroceryListId == id)
            .OrderBy(i => i.SortOrder).ThenBy(i => i.CreatedAt)
            .Select(i => new GroceryItemResponse(i.Id, i.GroceryListId, i.Name,
                i.Quantity, i.Category, i.IsChecked, i.SortOrder, i.UpdatedAt))
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost("lists/{id:guid}/items")]
    public async Task<ActionResult<GroceryItemResponse>> AddItem(Guid id, [FromBody] AddGroceryItemRequest req)
    {
        var userId = AuthService.GetCurrentUserId(User);
        var list = await db.GroceryLists.FirstOrDefaultAsync(l => l.Id == id && l.CreatedByUserId == userId);
        if (list == null) return NotFound();
        var maxOrder = await db.GroceryItems.Where(i => i.GroceryListId == id)
            .Select(i => (int?)i.SortOrder).MaxAsync() ?? -1;
        var item = new GroceryItem
        {
            GroceryListId = id, Name = req.Name,
            Quantity = req.Quantity, Category = req.Category,
            SortOrder = maxOrder + 1,
            CreatedByUserId = userId
        };
        db.GroceryItems.Add(item);
        list.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetItems), new { id },
            new GroceryItemResponse(item.Id, item.GroceryListId, item.Name,
                item.Quantity, item.Category, item.IsChecked, item.SortOrder, item.UpdatedAt));
    }

    [HttpPatch("items/{id:guid}")]
    public async Task<ActionResult<GroceryItemResponse>> PatchItem(Guid id, [FromBody] PatchGroceryItemRequest req)
    {
        var userId = AuthService.GetCurrentUserId(User);
        var item = await db.GroceryItems.Include(i => i.GroceryList)
            .FirstOrDefaultAsync(i => i.Id == id && i.GroceryList.CreatedByUserId == userId);
        if (item == null) return NotFound();
        if (req.Name != null) item.Name = req.Name;
        if (req.Quantity != null) item.Quantity = req.Quantity;
        if (req.Category != null) item.Category = req.Category;
        if (req.IsChecked.HasValue) item.IsChecked = req.IsChecked.Value;
        if (req.SortOrder.HasValue) item.SortOrder = req.SortOrder.Value;
        item.UpdatedAt = DateTime.UtcNow;
        item.GroceryList.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Ok(new GroceryItemResponse(item.Id, item.GroceryListId, item.Name,
            item.Quantity, item.Category, item.IsChecked, item.SortOrder, item.UpdatedAt));
    }

    [HttpDelete("items/{id:guid}")]
    public async Task<IActionResult> DeleteItem(Guid id)
    {
        var userId = AuthService.GetCurrentUserId(User);
        var item = await db.GroceryItems.Include(i => i.GroceryList)
            .FirstOrDefaultAsync(i => i.Id == id && i.GroceryList.CreatedByUserId == userId);
        if (item == null) return NotFound();
        db.GroceryItems.Remove(item);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("items/reorder")]
    public async Task<IActionResult> Reorder([FromBody] ReorderRequest req)
    {
        foreach (var r in req.Items)
        {
            var item = await db.GroceryItems.FindAsync(r.Id);
            if (item != null) item.SortOrder = r.SortOrder;
        }
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("lists/{id:guid}/items/checked")]
    public async Task<IActionResult> ClearChecked(Guid id)
    {
        var userId = AuthService.GetCurrentUserId(User);
        var list = await db.GroceryLists.FirstOrDefaultAsync(l => l.Id == id && l.CreatedByUserId == userId);
        if (list == null) return NotFound();
        var checked_ = await db.GroceryItems.Where(i => i.GroceryListId == id && i.IsChecked).ToListAsync();
        db.GroceryItems.RemoveRange(checked_);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
