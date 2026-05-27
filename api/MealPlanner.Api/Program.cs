using System.Text;
using AspNet.Security.OAuth.GitHub;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MealPlanner.Api.Data;
using MealPlanner.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Auth – three schemes:
//   1. JwtBearer          – validates auth_token cookie on every protected request
//   2. ExternalCookies    – short-lived temp cookie used during the OAuth redirect dance
//   3. Google / GitHub    – OAuth providers
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "dev-secret-change-in-production-please";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true, ValidIssuer = "meal-planner",
        ValidateAudience = true, ValidAudience = "meal-planner",
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        NameClaimType = "name",
    };
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = ctx =>
        {
            ctx.Token = ctx.Request.Cookies["auth_token"];
            return Task.CompletedTask;
        }
    };
})
.AddCookie("ExternalCookies", options =>
{
    options.Cookie.Name = "ext_auth";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.ExpireTimeSpan = TimeSpan.FromMinutes(10);
})
.AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
{
    options.SignInScheme = "ExternalCookies";
    options.ClientId = builder.Configuration["Google:ClientId"] ?? string.Empty;
    options.ClientSecret = builder.Configuration["Google:ClientSecret"] ?? string.Empty;
    options.CallbackPath = "/api/v1/auth/google/callback";
    options.Scope.Add("profile");
    options.Scope.Add("email");
    options.SaveTokens = false;
    options.ClaimActions.MapJsonKey("urn:google:picture", "picture");
    options.Events.OnCreatingTicket = ctx =>
    {
        // Tag the ticket with the scheme name so our Finalize action can read it
        ctx.Properties.Items[".AuthScheme"] = "google";
        return Task.CompletedTask;
    };
})
.AddGitHub(GitHubAuthenticationDefaults.AuthenticationScheme, options =>
{
    options.SignInScheme = "ExternalCookies";
    options.ClientId = builder.Configuration["GitHub:ClientId"] ?? string.Empty;
    options.ClientSecret = builder.Configuration["GitHub:ClientSecret"] ?? string.Empty;
    options.CallbackPath = "/api/v1/auth/github/callback";
    options.Scope.Add("user:email");
    options.SaveTokens = false;
    options.Events.OnCreatingTicket = ctx =>
    {
        ctx.Properties.Items[".AuthScheme"] = "github";
        return Task.CompletedTask;
    };
});

builder.Services.AddAuthorization();
builder.Services.AddScoped<AuthService>();
builder.Services.AddControllers();

// CORS
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? ["http://localhost:3000"];
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials());
});

var app = builder.Build();

// Auto-migrate + seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    if (!await db.GroceryLists.AnyAsync())
    {
        db.GroceryLists.Add(new MealPlanner.Api.Models.GroceryList { Name = "Grocery List" });
        await db.SaveChangesAsync();
    }
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
