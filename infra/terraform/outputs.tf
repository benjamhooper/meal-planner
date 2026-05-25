output "web_url" {
  description = "Public URL of the web frontend."
  value       = "https://${azurerm_container_app.web.ingress[0].fqdn}"
}

output "api_internal_name" {
  description = "Container Apps internal hostname for the API."
  value       = local.api_app_name
}

output "sql_server_fqdn" {
  description = "Azure SQL Server fully qualified domain name."
  value       = azurerm_mssql_server.sql.fully_qualified_domain_name
}
