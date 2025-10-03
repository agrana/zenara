terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
  }
}

# Create Vercel project
resource "vercel_project" "main" {
  name      = var.project_name
  framework = "nextjs"
  team_id   = var.team_id != "" ? var.team_id : null

  git_repository = {
    type = "github"
    repo = var.github_repo
  }

  # Build settings
  build_command   = "npm run build"
  install_command = "npm install"
  dev_command     = "npm run dev"
}

# Custom Domain
resource "vercel_project_domain" "main" {
  project_id = vercel_project.main.id
  domain     = var.domain_name
}

# WWW subdomain (optional)
resource "vercel_project_domain" "www" {
  project_id = vercel_project.main.id
  domain     = "www.${var.domain_name}"
}

# Environment Variables
resource "vercel_project_environment_variable" "supabase_url" {
  project_id = vercel_project.main.id
  key        = "VITE_SUPABASE_URL"
  value      = var.supabase_url
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "supabase_anon_key" {
  project_id = vercel_project.main.id
  key        = "VITE_SUPABASE_ANON_KEY"
  value      = var.supabase_anon_key
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "supabase_url_backend" {
  project_id = vercel_project.main.id
  key        = "SUPABASE_URL"
  value      = var.supabase_url
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "supabase_anon_key_backend" {
  project_id = vercel_project.main.id
  key        = "SUPABASE_ANON_KEY"
  value      = var.supabase_anon_key
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "supabase_service_role_key" {
  project_id = vercel_project.main.id
  key        = "SUPABASE_SERVICE_ROLE_KEY"
  value      = var.supabase_service_role_key
  target     = ["production", "preview"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "openai_api_key" {
  project_id = vercel_project.main.id
  key        = "OPENAI_API_KEY"
  value      = var.openai_api_key
  target     = ["production", "preview"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "openai_model" {
  count      = var.openai_model != "" ? 1 : 0
  project_id = vercel_project.main.id
  key        = "OPENAI_MODEL"
  value      = var.openai_model
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "node_env" {
  project_id = vercel_project.main.id
  key        = "NODE_ENV"
  value      = "production"
  target     = ["production"]
}
