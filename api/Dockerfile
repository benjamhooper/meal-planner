# ── Build stage ──────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore dependencies first (better Docker layer caching)
COPY MealPlanner.Api/MealPlanner.Api.csproj MealPlanner.Api/
RUN dotnet restore MealPlanner.Api/MealPlanner.Api.csproj

COPY . .
RUN dotnet publish MealPlanner.Api/MealPlanner.Api.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

# .NET 8+ defaults to port 8080 in containers; make it explicit.
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "MealPlanner.Api.dll"]
