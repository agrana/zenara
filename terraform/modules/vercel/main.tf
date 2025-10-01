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
