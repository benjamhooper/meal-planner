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
[Route("api/v1/mealplan")]
public class MealPlanController(AppDbContext db) : ControllerBase
{
    static DateOnly NormalizeToMonday(DateOnly date)
    {
        var diff = ((int)date.DayOfWeek - (int)DayOfWeek.Monday + 7) % 7;
        return date.AddDays(-diff);
    }

    [HttpGet("week/{weekStartDate}")]
    public async Task<ActionResult<MealPlanWeekResponse>> GetWeek(DateOnly weekStartDate)
    {
        var monday = NormalizeToMonday(weekStartDate);
        var week = await db.MealPlanWeeks
            .Include(w => w.Slots).ThenInclude(s => s.Recipe)
            .FirstOrDefaultAsync(w => w.WeekStartDate == monday);

        if (week == null) return NotFound();

        return Ok(MapWeek(week));
    }

    [HttpPost("slots")]
    public async Task<ActionResult<MealPlanSlotResponse>> CreateSlot([FromBody] CreateSlotRequest req)
    {
        var monday = NormalizeToMonday(req.WeekStartDate);
        var week = await db.MealPlanWeeks.FirstOrDefaultAsync(w => w.WeekStartDate == monday);
        if (week == null)
        {
            week = new MealPlanWeek { WeekStartDate = monday };
            db.MealPlanWeeks.Add(week);
            await db.SaveChangesAsync();
        }

        var existing = await db.MealPlanSlots.FirstOrDefaultAsync(s =>
            s.MealPlanWeekId == week.Id && s.DayOfWeek == req.DayOfWeek && s.MealType == req.MealType);

        if (existing != null)
        {
            existing.RecipeId = req.RecipeId;
            existing.CustomLabel = req.CustomLabel;
            existing.Notes = req.Notes;
            existing.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            await db.Entry(existing).Reference(s => s.Recipe).LoadAsync();
            return Ok(MapSlot(existing));
        }

        var slot = new MealPlanSlot
        {
            MealPlanWeekId = week.Id, DayOfWeek = req.DayOfWeek, MealType = req.MealType,
            RecipeId = req.RecipeId, CustomLabel = req.CustomLabel, Notes = req.Notes,
            CreatedByUserId = AuthService.GetCurrentUserId(User)
        };
        db.MealPlanSlots.Add(slot);
        await db.SaveChangesAsync();
        await db.Entry(slot).Reference(s => s.Recipe).LoadAsync();
        return CreatedAtAction(nameof(GetWeek), new { weekStartDate = monday }, MapSlot(slot));
    }

    [HttpPut("slots/{id:guid}")]
    public async Task<ActionResult<MealPlanSlotResponse>> UpdateSlot(Guid id, [FromBody] UpdateSlotRequest req)
    {
        var slot = await db.MealPlanSlots.Include(s => s.Recipe).FirstOrDefaultAsync(s => s.Id == id);
        if (slot == null) return NotFound();
        slot.RecipeId = req.RecipeId;
        slot.CustomLabel = req.CustomLabel;
        slot.Notes = req.Notes;
        slot.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        if (slot.RecipeId.HasValue) await db.Entry(slot).Reference(s => s.Recipe).LoadAsync();
        return Ok(MapSlot(slot));
    }

    [HttpDelete("slots/{id:guid}")]
    public async Task<IActionResult> DeleteSlot(Guid id)
    {
        var slot = await db.MealPlanSlots.FindAsync(id);
        if (slot == null) return NotFound();
        db.MealPlanSlots.Remove(slot);
        await db.SaveChangesAsync();
        return NoContent();
    }

    static MealPlanWeekResponse MapWeek(MealPlanWeek week) =>
        new(week.Id, week.WeekStartDate, week.Notes, week.Slots.Select(MapSlot).ToList());

    static MealPlanSlotResponse MapSlot(MealPlanSlot s) =>
        new(s.Id, s.MealPlanWeekId, s.DayOfWeek, s.MealType,
            s.RecipeId, s.Recipe?.Name, s.Recipe?.Type, s.CustomLabel, s.Notes);
}
