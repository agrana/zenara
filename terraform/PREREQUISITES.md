# Terraform Prerequisites Checklist

Before running `terraform apply`, ensure you have completed these steps:

## 1. Cloudflare Setup ✓

### Get Your Account ID
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Look at the URL in your browser: `https://dash.cloudflare.com/{YOUR_ACCOUNT_ID}/...`
3. **OR** Go to any domain → Overview → Right sidebar shows "Account ID"
4. Copy the **32-character hexadecimal ID** (e.g., `a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6`)
5. **IMPORTANT**: Verify it's exactly 32 characters long

### Create API Token
1. Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token" → "Custom token"
3. Set these permissions:
   - **Account Settings** → `Read`
   - **Zone** → `Edit`
   - **DNS** → `Edit`
   - **Email Routing Rules** → `Edit`
4. Set **Account Resources** → Include → Your account
5. Set **Zone Resources** → Include → All zones
6. Click "Continue to summary" → "Create Token"
7. Copy the token (you won't see it again!)

**Note:** You do NOT need to manually add your domain to Cloudflare - Terraform will create the zone.

## 2. Vercel Setup ✓

### Create Vercel Account
1. Go to [Vercel](https://vercel.com)
2. Sign up or log in (preferably with GitHub)

### Connect GitHub
1. In Vercel Dashboard → Settings → Git
2. Connect your GitHub account
3. Authorize Vercel to access repositories

### Create API Token
1. Go to [Vercel Tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Give it a name (e.g., "Terraform")
4. Set scope to "Full Account"
5. Click "Create" and copy the token

**Note:** You do NOT need to manually create the project - Terraform will do it.

## 3. GitHub Repository ✓

### Ensure Repository Exists
1. Your repository must exist: `https://github.com/agrana/zenara`
2. You must have **admin access** to the repository
3. The repository should have the Next.js code

## 4. Supabase Setup (Optional) ✓

If using Supabase, you need:

### Create Supabase Project
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Note the project ID from the URL

### Get Credentials
1. Go to Project Settings → API
2. Copy:
   - Project URL
   - `anon` key
   - `service_role` key

### Create Access Token
1. Go to [Account Tokens](https://supabase.com/dashboard/account/tokens)
2. Create a new token
3. Copy it

## 5. Validate Your Configuration ✓

Before running `terraform apply`:

```bash
cd terraform

# Check your terraform.tfvars has:
cat terraform.tfvars | grep -E "(cloudflare_account_id|cloudflare_api_token|vercel_api_token)"

# Verify Account ID is 32 characters:
grep cloudflare_account_id terraform.tfvars | grep -o '"[^"]*"' | wc -c
# Should output: 35 (32 chars + 2 quotes + 1 newline)
```

## 6. Run Terraform ✓

```bash
# Initialize (if not done)
terraform init

# Validate configuration
terraform validate

# See what will be created
terraform plan

# Create everything
terraform apply
```

## After Apply

1. **Copy the nameservers** from the Terraform output
2. **Update your domain registrar** with these Cloudflare nameservers
3. **Wait for DNS propagation** (5 minutes to 24 hours)
4. Your domain will then work with Cloudflare + Vercel!

## Troubleshooting

### Error: "Invalid organization identifier (1067)"
- Your Cloudflare Account ID is wrong
- Double-check it's exactly 32 characters
- Get it from the dashboard URL or Account Home

### Error: "Project not found" (Vercel)
- This shouldn't happen anymore - Terraform creates the project
- If it does, check your Vercel API token has full access

### Error: "Repository not accessible"
- Ensure Vercel is connected to your GitHub account
- Verify you have admin access to the repository
- Check the repo name format is correct: `owner/repo`

