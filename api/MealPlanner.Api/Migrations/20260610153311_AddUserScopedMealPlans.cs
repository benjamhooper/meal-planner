using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MealPlanner.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserScopedMealPlans : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_meal_plan_weeks_WeekStartDate",
                table: "meal_plan_weeks");

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "meal_plan_weeks",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_meal_plan_weeks_UserId",
                table: "meal_plan_weeks",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_meal_plan_weeks_WeekStartDate_UserId",
                table: "meal_plan_weeks",
                columns: new[] { "WeekStartDate", "UserId" },
                unique: true,
                filter: "[UserId] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_meal_plan_weeks_users_UserId",
                table: "meal_plan_weeks",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_meal_plan_weeks_users_UserId",
                table: "meal_plan_weeks");

            migrationBuilder.DropIndex(
                name: "IX_meal_plan_weeks_UserId",
                table: "meal_plan_weeks");

            migrationBuilder.DropIndex(
                name: "IX_meal_plan_weeks_WeekStartDate_UserId",
                table: "meal_plan_weeks");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "meal_plan_weeks");

            migrationBuilder.CreateIndex(
                name: "IX_meal_plan_weeks_WeekStartDate",
                table: "meal_plan_weeks",
                column: "WeekStartDate",
                unique: true);
        }
    }
}
