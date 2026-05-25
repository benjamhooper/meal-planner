data "azurerm_resource_group" "rg" {
  name = var.resource_group_name
}

locals {
  sql_name     = "${var.app_name}-sql-${substr(sha256(data.azurerm_resource_group.rg.id), 0, 8)}"
  api_app_name = "${var.app_name}-api"
  web_app_name = "${var.app_name}-web"
  db_conn      = "Server=${azurerm_mssql_server.sql.fully_qualified_domain_name},1433;Database=MealPlannerDb;User Id=${var.sql_admin_login};Password=${var.sql_admin_password};TrustServerCertificate=False;Encrypt=True;"
  frontend_url = var.frontend_url != "" ? var.frontend_url : "https://${azurerm_container_app.web.ingress[0].fqdn}"
}

# ── Log Analytics ─────────────────────────────────────────────────────────────

resource "azurerm_log_analytics_workspace" "logs" {
  name                = "${var.app_name}-logs"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

# ── Container Apps Environment ────────────────────────────────────────────────

resource "azurerm_container_app_environment" "env" {
  name                       = "${var.app_name}-env"
  location                   = var.location
  resource_group_name        = var.resource_group_name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.logs.id
}


# ── Azure SQL Server + Serverless Database ────────────────────────────────────

resource "azurerm_mssql_server" "sql" {
  name                         = local.sql_name
  location                     = var.location
  resource_group_name          = var.resource_group_name
  version                      = "12.0"
  administrator_login          = var.sql_admin_login
  administrator_login_password = var.sql_admin_password
}

# GP_S_Gen5 Serverless — auto-pauses after 60 min idle, billing stops
resource "azurerm_mssql_database" "db" {
  name                        = "MealPlannerDb"
  server_id                   = azurerm_mssql_server.sql.id
  sku_name                    = "GP_S_Gen5_1"
  auto_pause_delay_in_minutes = 60
  min_capacity                = 0.5
}

# Allow Azure-internal traffic so Container Apps can reach SQL
resource "azurerm_mssql_firewall_rule" "allow_azure" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.sql.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# ── Web Container App (Next.js — external, scales to zero) ───────────────────

resource "azurerm_container_app" "web" {
  name                         = local.web_app_name
  container_app_environment_id = azurerm_container_app_environment.env.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  secret {
    name  = "ghcr-token"
    value = var.ghcr_token
  }

  registry {
    server               = "ghcr.io"
    username             = var.ghcr_username
    password_secret_name = "ghcr-token"
  }

  ingress {
    external_enabled = true
    target_port      = 3000
    transport        = "http"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  template {
    min_replicas = 0
    max_replicas = 3

    container {
      name   = "web"
      image  = "ghcr.io/${var.ghcr_username}/meal-planner-web:latest"
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "API_INTERNAL_URL"
        value = "http://${local.api_app_name}"
      }
    }
  }
}

# ── API Container App (.NET — internal only, scales to zero) ─────────────────

resource "azurerm_container_app" "api" {
  name                         = local.api_app_name
  container_app_environment_id = azurerm_container_app_environment.env.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  secret {
    name  = "ghcr-token"
    value = var.ghcr_token
  }

  secret {
    name  = "db-connection-string"
    value = local.db_conn
  }

  secret {
    name  = "jwt-secret"
    value = var.jwt_secret
  }

  secret {
    name  = "google-client-secret"
    value = var.google_client_secret
  }

  secret {
    name  = "github-client-secret"
    value = var.github_client_secret
  }

  registry {
    server               = "ghcr.io"
    username             = var.ghcr_username
    password_secret_name = "ghcr-token"
  }

  ingress {
    external_enabled = false
    target_port      = 8080
    transport        = "http"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  template {
    min_replicas = 0
    max_replicas = 3

    container {
      name   = "api"
      image  = "ghcr.io/${var.ghcr_username}/meal-planner-api:latest"
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "ASPNETCORE_ENVIRONMENT"
        value = "Production"
      }

      env {
        name        = "ConnectionStrings__DefaultConnection"
        secret_name = "db-connection-string"
      }

      env {
        name        = "Jwt__Secret"
        secret_name = "jwt-secret"
      }

      env {
        name  = "Google__ClientId"
        value = var.google_client_id
      }

      env {
        name        = "Google__ClientSecret"
        secret_name = "google-client-secret"
      }

      env {
        name  = "GitHub__ClientId"
        value = var.github_client_id
      }

      env {
        name        = "GitHub__ClientSecret"
        secret_name = "github-client-secret"
      }

      env {
        name  = "FrontendUrl"
        value = local.frontend_url
      }

      env {
        name  = "AllowedOrigins__0"
        value = local.frontend_url
      }
    }
  }

}
