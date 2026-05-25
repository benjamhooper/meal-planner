variable "app_name" {
  description = "Lowercase name prefix applied to all resources."
  type        = string
  default     = "mealplanner"
}

variable "location" {
  description = "Azure region."
  type        = string
  default     = "southcentralus"
}

variable "resource_group_name" {
  description = "Name of the existing resource group to deploy into."
  type        = string
}

variable "sql_admin_login" {
  description = "SQL Server administrator username."
  type        = string
}

variable "sql_admin_password" {
  description = "SQL Server administrator password."
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret. Generate with: openssl rand -base64 48"
  type        = string
  sensitive   = true
}

variable "google_client_id" {
  description = "Google OAuth client ID (leave empty to disable)."
  type        = string
  default     = ""
}

variable "google_client_secret" {
  description = "Google OAuth client secret."
  type        = string
  sensitive   = true
  default     = ""
}

variable "github_client_id" {
  description = "GitHub OAuth client ID (leave empty to disable)."
  type        = string
  default     = ""
}

variable "github_client_secret" {
  description = "GitHub OAuth client secret."
  type        = string
  sensitive   = true
  default     = ""
}

variable "ghcr_token" {
  description = "GitHub PAT with read:packages scope for pulling images from ghcr.io."
  type        = string
  sensitive   = true
}

variable "ghcr_username" {
  description = "GitHub username or org that owns the container images on ghcr.io."
  type        = string
}

variable "frontend_url" {
  description = "Frontend URL override for CORS. Auto-detected from web Container App FQDN when empty."
  type        = string
  default     = ""
}
