# Family Meal Planner

A weekly meal planner PWA for families. Plan breakfast/lunch/dinner, manage a grocery checklist, and keep a recipe book — all in one place.

Installable on iPhone via Safari → Share → Add to Home Screen.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | ASP.NET Core (.NET 10), C# |
| Database | PostgreSQL 16 |
| Auth | Social login (Google / GitHub) → JWT in httpOnly cookie |
| PWA | next-pwa, web manifest, Apple touch icons |

---

## Authentication

Sign-in is handled via **OAuth social login** — no passwords to manage. Users click "Continue with Google" or "Continue with GitHub" and are redirected back automatically.

### Account linking by email

If the same email address is returned by two different providers, the app merges them into a single account automatically. Signing in with Google and then GitHub (or vice versa) using the same email address gives you the same profile and the same data.

### User data model

| Table | Purpose |
|---|---|
| `users` | Canonical account — keyed by email (unique) |
| `user_identities` | One row per OAuth provider per user |

---

## Local Development

### Prerequisites
- Docker Desktop
- .NET SDK 10+
- Node.js 20+

### 1. Start the database

```bash
docker compose up postgres -d
```

### 2. Register OAuth apps

You need credentials from at least one provider. Both are optional independently; register only the ones you want to test locally.

#### Google

1. Go to [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add **Authorised redirect URI**: `http://localhost:5000/api/v1/auth/google/callback`
4. Copy the **Client ID** and **Client Secret**

#### GitHub

1. Go to [GitHub → Settings → Developer settings → OAuth Apps → New OAuth App](https://github.com/settings/applications/new)
2. Set **Homepage URL**: `http://localhost:3000`
3. Set **Authorization callback URL**: `http://localhost:5000/api/v1/auth/github/callback`
4. Copy the **Client ID** and generate a **Client Secret**

### 3. Store secrets with `dotnet user-secrets`

```bash
cd api/MealPlanner.Api

# Google
dotnet user-secrets set "Google:ClientId"     "<your-google-client-id>"
dotnet user-secrets set "Google:ClientSecret" "<your-google-client-secret>"

# GitHub
dotnet user-secrets set "GitHub:ClientId"     "<your-github-client-id>"
dotnet user-secrets set "GitHub:ClientSecret" "<your-github-client-secret>"
```

These are stored outside the repo in your OS secrets store and are never committed.

### 4. Configure the frontend

```bash
cp web/.env.local.example web/.env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1  (already set in the example)
```

### 5. Run the API

```bash
cd api/MealPlanner.Api
dotnet watch run
# API available at http://localhost:5000
```

### 6. Run the frontend

```bash
cd web
npm install
npm run dev
# App available at http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000), click a social login button, and you will be redirected back to `/meals` on success.

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
| Azure Key Vault | Secrets (JWT secret, DB connection string, OAuth credentials) |

### GitHub Actions Secrets Required

| Secret | Description |
|---|---|
| `AZURE_API_APP_NAME` | App Service name |
| `AZURE_API_PUBLISH_PROFILE` | App Service publish profile XML |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | SWA deployment token |
| `NEXT_PUBLIC_API_URL` | Full API URL for the SWA build |

### App Service Configuration

Set these Application Settings on the App Service. All sensitive values should be Key Vault references.

```
ConnectionStrings__DefaultConnection  →  Key Vault reference
Jwt__Secret                           →  Key Vault reference

Google__ClientId                      →  Key Vault reference
Google__ClientSecret                  →  Key Vault reference

GitHub__ClientId                      →  Key Vault reference
GitHub__ClientSecret                  →  Key Vault reference

FrontendUrl                           →  https://your-swa.azurestaticapps.net
AllowedOrigins__0                     →  https://your-swa.azurestaticapps.net
ASPNETCORE_ENVIRONMENT                →  Production
```

Key Vault references use the format:
```
@Microsoft.KeyVault(SecretUri=https://VAULT.vault.azure.net/secrets/SECRET_NAME/)
```

The App Service needs a **system-assigned managed identity** with `Key Vault Secrets User` role on the vault.

### OAuth callback URLs for production

Register these additional redirect URIs in each provider's console:

| Provider | Callback URL |
|---|---|
| Google | `https://<your-api-domain>/api/v1/auth/google/callback` |
| GitHub | `https://<your-api-domain>/api/v1/auth/github/callback` |

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
