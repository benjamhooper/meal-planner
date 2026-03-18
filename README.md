# Family Meal Planner

A weekly meal planner PWA for families. Plan breakfast/lunch/dinner, manage a grocery checklist, and keep a recipe book — all in one place.

Installable on iPhone via Safari → Share → Add to Home Screen.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | ASP.NET Core (.NET 9), C# |
| Database | PostgreSQL 16 |
| Auth | Single family password → JWT in httpOnly cookie |
| PWA | next-pwa, web manifest, Apple touch icons |

---

## Local Development

### Prerequisites
- Docker Desktop
- .NET SDK 9+
- Node.js 20+

### 1. Start the database

```bash
docker compose up postgres -d
```

### 2. Configure environment

```bash
# API — edit appsettings.Development.json if needed (defaults work with Docker Compose)

# Frontend
cp web/.env.local.example web/.env.local
```

### 3. Run the API

```bash
cd api/MealPlanner.Api
dotnet watch run
# API available at http://localhost:5000
```

### 4. Run the frontend

```bash
cd web
npm install
npm run dev
# App available at http://localhost:3000
```

### 5. First-time setup

On first run, set the family password:

```bash
curl -X POST http://localhost:5000/api/v1/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"password": "your-family-password"}'
```

This endpoint returns `409 Conflict` if already configured.

Then open [http://localhost:3000](http://localhost:3000) and log in.

---

## PWA Icons

Placeholder icons are not included in the repo. Generate them once:

```bash
cd web
npm install --save-dev canvas
node scripts/generate-icons.js
```

This creates:
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/icon-512-maskable.png`
- `public/icons/apple-touch-icon.png`

Replace these with your own artwork before deploying.

---

## Database Migrations

Migrations are applied automatically on API startup (`db.Database.MigrateAsync()`).

To add a new migration manually:

```bash
cd api/MealPlanner.Api
dotnet ef migrations add <MigrationName>
```

---

## Azure Deployment

### Infrastructure

| Resource | Purpose |
|---|---|
| Azure Static Web Apps | Next.js frontend |
| Azure App Service (Linux) | ASP.NET Core API |
| Azure Database for PostgreSQL Flexible Server | Database |
| Azure Key Vault | Secrets (JWT secret, DB connection string) |

### GitHub Actions Secrets Required

| Secret | Description |
|---|---|
| `AZURE_API_APP_NAME` | App Service name |
| `AZURE_API_PUBLISH_PROFILE` | App Service publish profile XML |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | SWA deployment token |
| `NEXT_PUBLIC_API_URL` | Full API URL for the SWA build |

### App Service Configuration

Set these Application Settings on the App Service (they override `appsettings.json`):

```
ConnectionStrings__DefaultConnection  →  Key Vault reference
Jwt__Secret                           →  Key Vault reference
AllowedOrigins__0                     →  https://your-swa.azurestaticapps.net
ASPNETCORE_ENVIRONMENT                →  Production
```

Key Vault references use the format:
```
@Microsoft.KeyVault(SecretUri=https://VAULT.vault.azure.net/secrets/SECRET_NAME/)
```

The App Service needs a **system-assigned managed identity** with `Key Vault Secrets User` role on the vault.

### CORS Note

Production uses `SameSite=None; Secure` cookies (required for cross-origin SWA ↔ App Service requests). This is configured automatically based on `ASPNETCORE_ENVIRONMENT`.

---

## Project Structure

```
meal-planner/
├── web/                    # Next.js PWA frontend
│   ├── public/
│   │   ├── icons/          # PWA + Apple touch icons (generate with scripts/generate-icons.js)
│   │   └── manifest.json
│   ├── scripts/
│   │   └── generate-icons.js
│   └── src/
│       ├── app/            # App Router pages
│       ├── components/     # UI, layout, feature components
│       ├── hooks/          # React Query hooks
│       ├── lib/            # API client
│       └── types/          # Shared TypeScript interfaces
├── api/
│   └── MealPlanner.Api/    # ASP.NET Core Web API
│       ├── Controllers/
│       ├── Data/           # EF Core context + migrations
│       ├── DTOs/
│       ├── Models/
│       ├── Services/
│       └── Program.cs
├── .github/workflows/      # CI/CD (GitHub Actions)
├── docker-compose.yml      # Local Postgres
├── .env.example
└── README.md
```
