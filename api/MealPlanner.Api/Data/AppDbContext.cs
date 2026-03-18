using Microsoft.EntityFrameworkCore;
using MealPlanner.Api.Models;

namespace MealPlanner.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Recipe> Recipes => Set<Recipe>();
    public DbSet<MealPlanWeek> MealPlanWeeks => Set<MealPlanWeek>();
    public DbSet<MealPlanSlot> MealPlanSlots => Set<MealPlanSlot>();
    public DbSet<GroceryList> GroceryLists => Set<GroceryList>();
    public DbSet<GroceryItem> GroceryItems => Set<GroceryItem>();
    public DbSet<FamilyAuth> FamilyAuths => Set<FamilyAuth>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Recipe>(e =>
        {
            e.ToTable("recipes");
            e.HasKey(r => r.Id);
            e.Property(r => r.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(r => r.Name).IsRequired();
            e.Property(r => r.Type).IsRequired();
            e.Property(r => r.Ingredients).HasColumnType("jsonb");
            e.Property(r => r.Steps).HasColumnType("jsonb");
        });

        modelBuilder.Entity<MealPlanWeek>(e =>
        {
            e.ToTable("meal_plan_weeks");
            e.HasKey(w => w.Id);
            e.Property(w => w.Id).HasDefaultValueSql("gen_random_uuid()");
            e.HasIndex(w => w.WeekStartDate).IsUnique();
        });

        modelBuilder.Entity<MealPlanSlot>(e =>
        {
            e.ToTable("meal_plan_slots");
            e.HasKey(s => s.Id);
            e.Property(s => s.Id).HasDefaultValueSql("gen_random_uuid()");
            e.HasIndex(s => new { s.MealPlanWeekId, s.DayOfWeek, s.MealType }).IsUnique();
            e.HasOne(s => s.Week).WithMany(w => w.Slots).HasForeignKey(s => s.MealPlanWeekId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(s => s.Recipe).WithMany(r => r.MealPlanSlots).HasForeignKey(s => s.RecipeId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<GroceryList>(e =>
        {
            e.ToTable("grocery_lists");
            e.HasKey(l => l.Id);
            e.Property(l => l.Id).HasDefaultValueSql("gen_random_uuid()");
        });

        modelBuilder.Entity<GroceryItem>(e =>
        {
            e.ToTable("grocery_items");
            e.HasKey(i => i.Id);
            e.Property(i => i.Id).HasDefaultValueSql("gen_random_uuid()");
            e.HasOne(i => i.GroceryList).WithMany(l => l.Items).HasForeignKey(i => i.GroceryListId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FamilyAuth>(e =>
        {
            e.ToTable("family_auth");
            e.HasKey(a => a.Id);
            e.Property(a => a.Id).ValueGeneratedNever();
        });
    }
}
