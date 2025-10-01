# GitHub Secrets + Terraform Setup

This guide shows how to manage environment variables securely using GitHub Secrets and automatically deploy them to Vercel via Terraform.

## Architecture

```
GitHub Secrets → GitHub Actions → Terraform → Vercel Environment Variables
```

## Step 1: Add GitHub Secrets

Go to your GitHub repository:
1. Click **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** for each:

### Required Secrets

#### Cloudflare
```
CLOUDFLARE_API_TOKEN = your-cloudflare-api-token
CLOUDFLARE_ACCOUNT_ID = your-32-char-account-id
```

#### Vercel
```
VERCEL_API_TOKEN = your-vercel-api-token
VERCEL_TEAM_ID = your-team-id (or leave empty for personal)
```

#### Supabase (for Vercel deployment)
```
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_ANON_KEY = your-anon-key
SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
SUPABASE_ACCESS_TOKEN = your-supabase-access-token (for Terraform provider)
```

#### OpenAI
```
OPENAI_API_KEY = sk-your-openai-key
```

## Step 2: Add GitHub Variables

For non-sensitive configuration, use **Variables** instead of Secrets:

1. Go to **Settings** → **Secrets and variables** → **Actions** → **Variables** tab
2. Click **New repository variable** for each:

```
DOMAIN_NAME = zenara.be
APP_URL = zenara.vercel.app
SUPPORT_EMAIL = support@zenara.be
CONTACT_EMAIL = info@zenara.be
VERCEL_PROJECT_NAME = zenara
GITHUB_REPO = agrana/zenara
SUPABASE_PROJECT_ID = (optional, leave empty if not using)
```

## Step 3: How It Works

### Automatic Deployment

When you push changes to `terraform/` directory:
1. GitHub Actions triggers automatically
2. Reads secrets from GitHub
3. Passes them to Terraform as `TF_VAR_*` environment variables
4. Terraform applies changes
5. Vercel environment variables are updated automatically

### Manual Deployment

You can also trigger manually:
1. Go to **Actions** tab in GitHub
2. Select "Deploy Infrastructure with Terraform"
3. Click **Run workflow**

## Step 4: Local Development

For local Terraform runs, create `terraform/terraform.tfvars`:

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
terraform plan
terraform apply
```

**Note:** `terraform.tfvars` is gitignored to prevent committing secrets.

## Step 5: Verify Deployment

After Terraform runs:

1. **Check GitHub Actions**
   - Go to Actions tab
   - Verify the workflow succeeded

2. **Check Vercel**
   - Go to https://vercel.com/dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Verify all variables are set

3. **Trigger Redeploy**
   - Vercel may need a redeploy to pick up new env vars
   - Go to Deployments → Click "..." → Redeploy

## Benefits

✅ **Security**: Secrets never stored in code  
✅ **Automation**: Environment variables auto-sync to Vercel  
✅ **Version Control**: Infrastructure changes tracked in git  
✅ **Audit Trail**: GitHub Actions logs all deployments  
✅ **No Manual Steps**: Update secrets once, everything updates automatically

## Workflow File

The automation is defined in:
```
.github/workflows/terraform-deploy.yml
```

## Troubleshooting

### "Error: No value for required variable"
- Check that all required secrets are set in GitHub
- Verify secret names match exactly (case-sensitive)

### "Error creating vercel_project_environment_variable"
- Ensure Vercel API token has correct permissions
- Check that the Vercel project exists

### Variables not updating in Vercel
- Check GitHub Actions logs for errors
- Manually trigger a Vercel redeploy after Terraform runs

## Alternative: Use Terraform Cloud

For better state management and collaboration:

1. Create account at https://app.terraform.io
2. Create workspace linked to GitHub repo
3. Add variables in Terraform Cloud UI
4. Remove GitHub Actions workflow (Terraform Cloud auto-runs)

