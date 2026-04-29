# Family Meal Planner

A weekly meal planner PWA for families. Plan breakfast/lunch/dinner, manage a grocery checklist, and keep a recipe book — all in one place.

Installable on iPhone via Safari → Share → Add to Home Screen.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | ASP.NET Core (.NET 10), C# |
| Database | SQL Server 2022 |
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
docker compose up sqlserver -d
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

### Architecture

```
Browser → Container Apps Web (Next.js, external HTTPS)
              └── /api/* proxy → Container Apps API (.NET, internal only)
                                      └── Azure SQL Database (Serverless)
                                      └── Azure Key Vault (secrets via managed identity)
```

Everything runs on the **Container Apps Consumption plan** — you pay only for actual compute used, and both apps scale to zero when idle.

| Resource | SKU | Estimated cost |
|---|---|---|
| Container Apps (web + api) | Consumption | ~$0–5/mo |
| Azure SQL Database | Serverless GP_S_Gen5 (1 vCore, auto-pause 60 min) | ~$5–15/mo |
| Azure Key Vault | Standard | ~$0.60/mo |
| Log Analytics | PerGB2018 (5 GB/day free) | ~$0/mo |
| **Total** | | **~$6–20/mo** |

Container images are stored on **GitHub Container Registry (ghcr.io)** — free for packages in public and private repos.

### One-time setup

#### 1. Create a resource group

```bash
az group create --name meal-planner-rg --location eastus
```

#### 2. Create a service principal and configure OIDC for GitHub Actions

```bash
# Create an app registration
az ad app create --display-name meal-planner-gh-actions
# Note the appId in the output, then create the service principal
az ad sp create --id <appId>
# Grant it Contributor access on the resource group
az role assignment create \
  --role Contributor \
  --assignee <appId> \
  --scope /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/meal-planner-rg
```

Then add a **federated credential** so GitHub Actions can authenticate without storing a secret:

1. Azure Portal → **App registrations** → `meal-planner-gh-actions`
2. **Certificates & secrets → Federated credentials → Add credential**
3. Select scenario **GitHub Actions deploying Azure resources**
4. Fill in your GitHub org/user, repo name, and set entity to **Branch: master**
5. Save — note the **Application (client) ID** and your **Directory (tenant) ID**

#### 3. Create a GitHub PAT for GHCR image pulls

Go to **GitHub → Settings → Developer settings → Personal access tokens (classic)** and create a token with `read:packages` scope. This lets Container Apps pull images from ghcr.io.

#### 4. Set GitHub Actions secrets

| Secret | Value |
|---|---|
| `AZURE_CLIENT_ID` | Application (client) ID from step 2 |
| `AZURE_TENANT_ID` | Directory (tenant) ID from step 2 |
| `AZURE_SUBSCRIPTION_ID` | Your Azure subscription ID |
| `AZURE_RESOURCE_GROUP` | `meal-planner-rg` |
| `AZURE_API_CONTAINER_APP_NAME` | `mealplanner-api` |
| `AZURE_WEB_CONTAINER_APP_NAME` | `mealplanner-web` |
| `SQL_ADMIN_LOGIN` | SQL administrator username |
| `SQL_ADMIN_PASSWORD` | Strong SQL password |
| `JWT_SECRET` | Random secret — `openssl rand -base64 48` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (or leave blank) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GH_CLIENT_ID` | GitHub OAuth client ID (or leave blank) |
| `GH_CLIENT_SECRET` | GitHub OAuth client secret |
| `GHCR_TOKEN` | GitHub PAT from step 3 |

#### 5. Provision infrastructure

Push any change to `infra/main.bicep`, or trigger **Deploy Infrastructure** manually from the Actions tab. Bicep creates all Azure resources idempotently.

After the first run, the workflow outputs the web app URL (e.g. `https://mealplanner-web.<hash>.eastus.azurecontainerapps.io`).

#### 6. Deploy the apps

Push changes to `api/**` or `web/**` — the respective workflow builds a Docker image, pushes it to ghcr.io, and rolls out a new Container App revision.

### OAuth callback URLs for production

Register these redirect URIs in each provider's console:

| Provider | Callback URL |
|---|---|
| Google | `https://<web-app-fqdn>/api/v1/auth/google/callback` |
| GitHub | `https://<web-app-fqdn>/api/v1/auth/github/callback` |

> The API is not publicly exposed — all requests go through the Next.js server, which proxies `/api/*` internally to the API Container App. The OAuth callbacks are handled by the Next.js proxy as well.

### How the proxy works

In Docker Compose the Next.js server proxies `/api/*` to `http://api:8080` (the compose service name). In Azure Container Apps, apps within the same environment are reachable by their app name via internal DNS, so the proxy target becomes `http://mealplanner-api`. The `API_INTERNAL_URL` Docker build arg controls this — it is baked into the Next.js routes manifest at image build time.

### Custom domain (optional)

By default the web app is reachable at the auto-generated Container Apps FQDN. To map a subdomain (e.g. `meals.yourdomain.com`) instead:

#### 1. Get the auto-generated FQDN

```bash
az containerapp show \
  --name mealplanner-web \
  --resource-group meal-planner-rg \
  --query "properties.configuration.ingress.fqdn" -o tsv
# e.g. mealplanner-web.happysand-abc123.eastus.azurecontainerapps.io
```

#### 2. Get the domain verification token

```bash
az containerapp show \
  --name mealplanner-web \
  --resource-group meal-planner-rg \
  --query "properties.customDomainVerificationId" -o tsv
```

#### 3. Add DNS records in Azure DNS

In your Azure DNS zone add two records for the chosen subdomain:

| Type | Name | Value |
|---|---|---|
| CNAME | `meals` | the FQDN from step 1 |
| TXT | `asuid.meals` | the verification token from step 2 |

#### 4. Bind the custom domain and provision a managed certificate

```bash
az containerapp hostname add \
  --name mealplanner-web \
  --resource-group meal-planner-rg \
  --hostname meals.yourdomain.com

az containerapp hostname bind \
  --name mealplanner-web \
  --resource-group meal-planner-rg \
  --hostname meals.yourdomain.com \
  --environment mealplanner-env \
  --validation-method CNAME
```

Azure automatically provisions and renews a free TLS certificate via Let's Encrypt. Allow a few minutes for DNS propagation before running `hostname bind`.

#### 5. Update CORS and OAuth

Once the domain is live, pass it to the infra workflow so the API's CORS config is updated. In `.github/workflows/infra.yml` add to the `parameters` block:

```yaml
frontendUrl=https://meals.yourdomain.com
```

Then update the redirect URIs in each OAuth provider's console:

| Provider | Callback URL |
|---|---|
| Google | `https://meals.yourdomain.com/api/v1/auth/google/callback` |
| GitHub | `https://meals.yourdomain.com/api/v1/auth/github/callback` |

---

## Project Structure

```
meal-planner/
├── infra/
│   └── main.bicep              # Azure infrastructure (Container Apps, SQL, Key Vault)
├── web/                        # Next.js PWA frontend
│   ├── public/
│   │   ├── icons/              # PWA + Apple touch icons
│   │   └── manifest.json
│   ├── scripts/
│   │   └── generate-icons.js
│   └── src/
│       ├── app/                # App Router pages
│       ├── components/         # UI, layout, feature components
│       ├── hooks/              # React Query hooks
│       ├── lib/                # API client
│       └── types/              # Shared TypeScript interfaces
├── api/
│   └── MealPlanner.Api/        # ASP.NET Core Web API
│       ├── Controllers/
│       ├── Data/               # EF Core context + migrations
│       ├── DTOs/
│       ├── Models/
│       ├── Services/
│       └── Program.cs
├── .github/workflows/          # CI/CD (GitHub Actions)
│   ├── infra.yml               # Provision Azure resources (Bicep)
│   ├── deploy-api.yml          # Build + push API image, update Container App
│   └── deploy-web.yml          # Build + push web image, update Container App
├── docker-compose.yml          # Local dev (SQL Server + API + web)
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