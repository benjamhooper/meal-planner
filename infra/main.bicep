// ─────────────────────────────────────────────────────────────────────────────
// Meal Planner — Azure Infrastructure (Bicep)
//
// Architecture (Consumption / pay-per-use):
//   Browser → Container Apps Web (Next.js, external)
//             → Container Apps API (.NET, internal) → Azure SQL (Serverless)
//   API reads secrets from Key Vault via managed identity
//   Images pulled from GitHub Container Registry (ghcr.io)
//
// Estimated cost for a lightly-used personal app:
//   Container Apps:  ~$0–5/mo  (scales to zero when idle)
//   SQL Serverless:  ~$5–15/mo (auto-pauses after 60 min idle)
//   Key Vault:       ~$0.60/mo
//   Log Analytics:    free tier (5 GB/day ingestion included)
// ─────────────────────────────────────────────────────────────────────────────

targetScope = 'resourceGroup'

// ── Parameters ────────────────────────────────────────────────────────────────

@description('Lowercase name prefix applied to all resources.')
param appName string = 'mealplanner'

@description('Azure region. Defaults to the resource group location.')
param location string = resourceGroup().location

@description('SQL Server administrator username.')
param sqlAdminLogin string

@secure()
@description('SQL Server administrator password.')
param sqlAdminPassword string

@secure()
@description('JWT signing secret. Generate with: openssl rand -base64 48')
param jwtSecret string

@description('Google OAuth client ID (leave empty to disable Google login).')
param googleClientId string = ''

@secure()
@description('Google OAuth client secret.')
param googleClientSecret string = ''

@description('GitHub OAuth client ID (leave empty to disable GitHub login).')
param githubClientId string = ''

@secure()
@description('GitHub OAuth client secret.')
param githubClientSecret string = ''

@secure()
@description('GitHub PAT with read:packages scope — used by Container Apps to pull images from ghcr.io.')
param ghcrToken string

@description('GitHub username or org that owns the container images on ghcr.io.')
param ghcrUsername string

@description('Frontend URL override for CORS. Auto-detected from the web Container App FQDN when left empty.')
param frontendUrl string = ''

// ── Derived names ─────────────────────────────────────────────────────────────

var kvName     = take('${appName}kv${uniqueString(resourceGroup().id)}', 24)
var sqlName    = '${appName}-sql-${uniqueString(resourceGroup().id)}'
var apiAppName = '${appName}-api'
var webAppName = '${appName}-web'

// ── Log Analytics (required for Container Apps; 5 GB/day free) ───────────────

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: '${appName}-logs'
  location: location
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
  }
}

// ── Container Apps Environment (Consumption plan — scale to zero) ─────────────

resource containerEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: '${appName}-env'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

// ── Managed Identity (API reads Key Vault secrets without storing credentials) ─

resource apiIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: '${appName}-api-id'
  location: location
}

// ── Key Vault ─────────────────────────────────────────────────────────────────

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: kvName
  location: location
  properties: {
    sku: { family: 'A', name: 'standard' }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    softDeleteRetentionInDays: 7
    enableSoftDelete: true
  }
}

// Grant the API managed identity the built-in "Key Vault Secrets User" role
var kvSecretsUserRoleId = '4633458b-17de-408a-b874-0445c86b69e4'
resource kvRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: keyVault
  name: guid(keyVault.id, apiIdentity.id, kvSecretsUserRoleId)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', kvSecretsUserRoleId)
    principalId: apiIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// ── Azure SQL Server + Serverless Database ────────────────────────────────────

resource sqlServer 'Microsoft.Sql/servers@2023-08-01-preview' = {
  name: sqlName
  location: location
  properties: {
    administratorLogin: sqlAdminLogin
    administratorLoginPassword: sqlAdminPassword
    version: '12.0'
  }
}

// GP_S_Gen5 = General Purpose Serverless, Gen5 hardware, 1 vCore max
// autoPauseDelay: 60 min — database pauses when idle, billing stops
// minCapacity: 0.5 vCore minimum when active (cheapest setting)
resource sqlDb 'Microsoft.Sql/servers/databases@2023-08-01-preview' = {
  parent: sqlServer
  name: 'MealPlannerDb'
  location: location
  sku: {
    name: 'GP_S_Gen5'
    tier: 'GeneralPurpose'
    family: 'Gen5'
    capacity: 1
  }
  properties: {
    autoPauseDelay: 60
    minCapacity: json('0.5')
  }
}

// Allow Azure-internal traffic so Container Apps can reach SQL
resource sqlFirewall 'Microsoft.Sql/servers/firewallRules@2023-08-01-preview' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// ── Key Vault secrets ─────────────────────────────────────────────────────────

var dbConnString = 'Server=${sqlServer.properties.fullyQualifiedDomainName},1433;Database=MealPlannerDb;User Id=${sqlAdminLogin};Password=${sqlAdminPassword};TrustServerCertificate=False;Encrypt=True;'

resource kvDbConn 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'DbConnectionString'
  properties: { value: dbConnString }
}

resource kvJwt 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'JwtSecret'
  properties: { value: jwtSecret }
}

resource kvGoogleId 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'GoogleClientId'
  properties: { value: googleClientId }
}

resource kvGoogleSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'GoogleClientSecret'
  properties: { value: googleClientSecret }
}

resource kvGithubId 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'GithubClientId'
  properties: { value: githubClientId }
}

resource kvGithubSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'GithubClientSecret'
  properties: { value: githubClientSecret }
}

// ── Web Container App (Next.js — externally reachable, scales to zero) ────────

resource webApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: webAppName
  location: location
  properties: {
    environmentId: containerEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
        allowInsecure: false
      }
      registries: [
        {
          server: 'ghcr.io'
          username: ghcrUsername
          passwordSecretRef: 'ghcr-token'
        }
      ]
      secrets: [
        { name: 'ghcr-token', value: ghcrToken }
      ]
    }
    template: {
      containers: [
        {
          name: 'web'
          image: 'ghcr.io/${ghcrUsername}/meal-planner-web:latest'
          resources: { cpu: json('0.5'), memory: '1Gi' }
          env: [
            { name: 'NODE_ENV', value: 'production' }
            // Next.js rewrites proxy /api/* to this URL (resolved at build time via ARG)
            // Container Apps internal DNS: apps in the same env are reachable by app name
            { name: 'API_INTERNAL_URL', value: 'http://${apiAppName}' }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 3
      }
    }
  }
}

// ── API Container App (.NET — internal only, scales to zero) ─────────────────

resource apiApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: apiAppName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: { '${apiIdentity.id}': {} }
  }
  properties: {
    environmentId: containerEnv.id
    configuration: {
      ingress: {
        external: false
        targetPort: 8080
        transport: 'http'
      }
      registries: [
        {
          server: 'ghcr.io'
          username: ghcrUsername
          passwordSecretRef: 'ghcr-token'
        }
      ]
      secrets: [
        { name: 'ghcr-token', value: ghcrToken }
        // These secrets are pulled from Key Vault using the managed identity — no stored credentials
        {
          name: 'db-connection-string'
          keyVaultUrl: kvDbConn.properties.secretUri
          identity: apiIdentity.id
        }
        {
          name: 'jwt-secret'
          keyVaultUrl: kvJwt.properties.secretUri
          identity: apiIdentity.id
        }
        {
          name: 'google-client-secret'
          keyVaultUrl: kvGoogleSecret.properties.secretUri
          identity: apiIdentity.id
        }
        {
          name: 'github-client-secret'
          keyVaultUrl: kvGithubSecret.properties.secretUri
          identity: apiIdentity.id
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'api'
          image: 'ghcr.io/${ghcrUsername}/meal-planner-api:latest'
          resources: { cpu: json('0.5'), memory: '1Gi' }
          env: [
            { name: 'ASPNETCORE_ENVIRONMENT', value: 'Production' }
            { name: 'ConnectionStrings__DefaultConnection', secretRef: 'db-connection-string' }
            { name: 'Jwt__Secret', secretRef: 'jwt-secret' }
            { name: 'Google__ClientId', value: googleClientId }
            { name: 'Google__ClientSecret', secretRef: 'google-client-secret' }
            { name: 'GitHub__ClientId', value: githubClientId }
            { name: 'GitHub__ClientSecret', secretRef: 'github-client-secret' }
            // Use the provided frontendUrl, or fall back to the auto-detected web app FQDN
            {
              name: 'FrontendUrl'
              value: empty(frontendUrl) ? 'https://${webApp.properties.configuration.ingress.fqdn}' : frontendUrl
            }
            {
              name: 'AllowedOrigins__0'
              value: empty(frontendUrl) ? 'https://${webApp.properties.configuration.ingress.fqdn}' : frontendUrl
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 3
      }
    }
  }
  dependsOn: [kvRoleAssignment, kvDbConn, kvJwt, kvGoogleSecret, kvGithubSecret]
}

// ── Outputs ───────────────────────────────────────────────────────────────────

@description('Public URL of the web frontend.')
output webUrl string = 'https://${webApp.properties.configuration.ingress.fqdn}'

@description('Container Apps internal hostname for the API (used by the web app to proxy /api/* requests).')
output apiInternalName string = apiAppName

@description('Azure SQL Server fully qualified domain name.')
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName

@description('Key Vault name (for manual secret management).')
output keyVaultName string = keyVault.name
