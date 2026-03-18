using Microsoft.EntityFrameworkCore;
using MealPlanner.Api.Models;

namespace MealPlanner.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserIdentity> UserIdentities => Set<UserIdentity>();
    public DbSet<Recipe> Recipes => Set<Recipe>();
    public DbSet<MealPlanWeek> MealPlanWeeks => Set<MealPlanWeek>();
    public DbSet<MealPlanSlot> MealPlanSlots => Set<MealPlanSlot>();
    public DbSet<GroceryList> GroceryLists => Set<GroceryList>();
    public DbSet<GroceryItem> GroceryItems => Set<GroceryItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(u => u.Id);
            e.Property(u => u.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(u => u.Email).IsRequired();
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Name).IsRequired();
        });

        modelBuilder.Entity<UserIdentity>(e =>
        {
            e.ToTable("user_identities");
            e.HasKey(i => i.Id);
            e.Property(i => i.Id).HasDefaultValueSql("gen_random_uuid()");
            e.HasIndex(i => new { i.Provider, i.ProviderUserId }).IsUnique();
            e.Property(i => i.Provider).IsRequired();
            e.Property(i => i.ProviderUserId).IsRequired();
            e.HasOne(i => i.User)
             .WithMany(u => u.Identities)
             .HasForeignKey(i => i.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Recipe>(e =>
        {
            e.ToTable("recipes");
            e.HasKey(r => r.Id);
            e.Property(r => r.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(r => r.Name).IsRequired();
            e.Property(r => r.Type).IsRequired();
            e.Property(r => r.Ingredients).HasColumnType("jsonb");
            e.Property(r => r.Steps).HasColumnType("jsonb");
            e.HasOne(r => r.CreatedBy).WithMany().HasForeignKey(r => r.CreatedByUserId).OnDelete(DeleteBehavior.SetNull);
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
            e.HasOne(s => s.CreatedBy).WithMany().HasForeignKey(s => s.CreatedByUserId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<GroceryList>(e =>
        {
            e.ToTable("grocery_lists");
            e.HasKey(l => l.Id);
            e.Property(l => l.Id).HasDefaultValueSql("gen_random_uuid()");
            e.HasOne(l => l.CreatedBy).WithMany().HasForeignKey(l => l.CreatedByUserId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<GroceryItem>(e =>
        {
            e.ToTable("grocery_items");
            e.HasKey(i => i.Id);
            e.Property(i => i.Id).HasDefaultValueSql("gen_random_uuid()");
            e.HasOne(i => i.GroceryList).WithMany(l => l.Items).HasForeignKey(i => i.GroceryListId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(i => i.CreatedBy).WithMany().HasForeignKey(i => i.CreatedByUserId).OnDelete(DeleteBehavior.SetNull);
        });
    }
}
