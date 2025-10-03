# GitHub Secrets + Terraform Setup

This guide shows how to manage environment variables securely using GitHub Secrets and automatically deploy them to Vercel via Terraform.

## Architecture

```
GitHub Secrets → GitHub Actions → Terraform (state as encrypted artifact) → Vercel Environment Variables
```

**No external services required!** State is stored as an encrypted GitHub artifact using the [terraform-state action](https://github.com/marketplace/actions/terraform-state).

## Step 1: Add GitHub Secrets

Go to your GitHub repository:
1. Click **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** for each:

### Required Secrets

#### Terraform State Encryption
```
TF_STATE_ENCRYPTION_KEY = your-random-256-bit-key
```
Generate a secure key:
```bash
openssl rand -hex 32
```
This encrypts your Terraform state file in GitHub artifacts (AES-256).

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
GIT_REPOSITORY = agrana/zenara
VERCEL_TEAM_ID = (leave empty for personal)
SUPABASE_PROJECT_ID = (optional, leave empty if not using)
```

**Note:** Use `GIT_REPOSITORY` instead of `GITHUB_REPO` - GitHub reserves variables starting with `GITHUB_`.

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

✅ **Security**: Secrets never stored in code, state file encrypted with AES-256  
✅ **Automation**: Environment variables auto-sync to Vercel  
✅ **Version Control**: Infrastructure changes tracked in git  
✅ **Audit Trail**: GitHub Actions logs all deployments  
✅ **No Manual Steps**: Update secrets once, everything updates automatically  
✅ **No External Services**: Everything stays in GitHub, no credit cards required  
✅ **Free Forever**: Uses GitHub's built-in artifact storage

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

### State file issues
- State is stored as GitHub artifact (lasts 90 days by default)
- If artifact expires, Terraform will recreate from scratch
- Can adjust artifact retention in repo Settings → Actions → General
- State is encrypted with your `TF_STATE_ENCRYPTION_KEY`

### First run fails with "state not found"
- This is normal - first run creates the state
- The `continue-on-error: true` on download step handles this
- Subsequent runs will download existing state

