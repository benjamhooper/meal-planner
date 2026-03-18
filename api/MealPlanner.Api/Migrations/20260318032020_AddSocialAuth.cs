using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MealPlanner.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSocialAuth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "family_auth");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "recipes",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "meal_plan_slots",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "grocery_lists",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "grocery_items",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    Provider = table.Column<string>(type: "text", nullable: false),
                    ProviderUserId = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    AvatarUrl = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_recipes_CreatedByUserId",
                table: "recipes",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_meal_plan_slots_CreatedByUserId",
                table: "meal_plan_slots",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_grocery_lists_CreatedByUserId",
                table: "grocery_lists",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_grocery_items_CreatedByUserId",
                table: "grocery_items",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_users_Provider_ProviderUserId",
                table: "users",
                columns: new[] { "Provider", "ProviderUserId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_grocery_items_users_CreatedByUserId",
                table: "grocery_items",
                column: "CreatedByUserId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_grocery_lists_users_CreatedByUserId",
                table: "grocery_lists",
                column: "CreatedByUserId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_meal_plan_slots_users_CreatedByUserId",
                table: "meal_plan_slots",
                column: "CreatedByUserId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_recipes_users_CreatedByUserId",
                table: "recipes",
                column: "CreatedByUserId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_grocery_items_users_CreatedByUserId",
                table: "grocery_items");

            migrationBuilder.DropForeignKey(
                name: "FK_grocery_lists_users_CreatedByUserId",
                table: "grocery_lists");

            migrationBuilder.DropForeignKey(
                name: "FK_meal_plan_slots_users_CreatedByUserId",
                table: "meal_plan_slots");

            migrationBuilder.DropForeignKey(
                name: "FK_recipes_users_CreatedByUserId",
                table: "recipes");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropIndex(
                name: "IX_recipes_CreatedByUserId",
                table: "recipes");

            migrationBuilder.DropIndex(
                name: "IX_meal_plan_slots_CreatedByUserId",
                table: "meal_plan_slots");

            migrationBuilder.DropIndex(
                name: "IX_grocery_lists_CreatedByUserId",
                table: "grocery_lists");

            migrationBuilder.DropIndex(
                name: "IX_grocery_items_CreatedByUserId",
                table: "grocery_items");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "recipes");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "meal_plan_slots");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "grocery_lists");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "grocery_items");

            migrationBuilder.CreateTable(
                name: "family_auth",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_family_auth", x => x.Id);
                });
        }
    }
}
