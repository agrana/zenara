# Local variables for common values
locals {
  domain_name = var.domain_name
  zone_id     = data.cloudflare_zone.main.id
}

# Use existing Cloudflare zone (already created)
# Note: Zone must be manually added to Cloudflare first
data "cloudflare_zone" "main" {
  name = local.domain_name
}

# DNS Module
module "dns" {
  source = "./modules/dns"

  zone_id     = local.zone_id
  domain_name = local.domain_name
  app_url     = var.app_url
}

# Email Routing Module
module "email_routing" {
  source = "./modules/email_routing"

  zone_id       = local.zone_id
  domain_name   = local.domain_name
  support_email = var.support_email
  contact_email = var.contact_email
}

# Vercel Module
module "vercel" {
  source = "./modules/vercel"

  project_name              = var.vercel_project_name
  domain_name               = local.domain_name
  github_repo               = var.github_repo
  team_id                   = var.vercel_team_id
  supabase_url              = var.supabase_url
  supabase_anon_key         = var.supabase_anon_key
  supabase_service_role_key = var.supabase_service_role_key
  openai_api_key            = var.openai_api_key
  openai_model              = var.openai_model
}

# Supabase Module (conditional - only if project_id is provided)
module "supabase" {
  source = "./modules/supabase"
  count  = var.supabase_project_id != "" ? 1 : 0

  project_id = var.supabase_project_id
}

# Cloudflare Outputs
output "cloudflare_nameservers" {
  description = "Cloudflare nameservers - configure these at your domain registrar"
  value       = data.cloudflare_zone.main.name_servers
}

output "cloudflare_zone_id" {
  description = "Cloudflare Zone ID"
  value       = data.cloudflare_zone.main.id
}

# Vercel Outputs
output "vercel_project_url" {
  description = "The URL of the Vercel project"
  value       = module.vercel.project_url
}

output "vercel_domain_url" {
  description = "The custom domain URL"
  value       = module.vercel.domain_url
}

# Supabase Outputs (only if Supabase is configured)
output "supabase_project_url" {
  description = "The URL of the Supabase project"
  value       = var.supabase_project_id != "" ? module.supabase[0].project_url : "Not configured"
}

output "supabase_api_url" {
  description = "The API URL of the Supabase project"
  value       = var.supabase_project_id != "" ? module.supabase[0].api_url : "Not configured"
}
