# TerraMind Deployment Guide

This guide provides step-by-step instructions for deploying TerraMind to GitHub and various hosting platforms.

## Table of Contents
1. [GitHub Repository Setup](#github-repository-setup)
2. [Environment Configuration](#environment-configuration)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Backend Status (Supabase)](#backend-status-supabase)
5. [CI/CD with GitHub Actions](#cicd-with-github-actions)
6. [Optional API Keys](#optional-api-keys)

---

## GitHub Repository Setup

### Step 1: Initialize Git Repository

From your project directory:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: TerraMind AI-Powered Land Regeneration Platform"
```

### Step 2: Create GitHub Repository

**Option A: Using GitHub CLI (Recommended)**

```bash
# Install GitHub CLI if not already installed
# Visit: https://cli.github.com/

# Login to GitHub
gh auth login

# Create repository
gh repo create terramind --public --source=. --remote=origin --push

# Or for private repository
gh repo create terramind --private --source=. --remote=origin --push
```

**Option B: Using GitHub Web Interface**

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `terramind`
3. Description: "AI-Powered Land Regeneration Assistant - Empowering sustainable agriculture through data-driven insights"
4. Choose Public or Private
5. Do NOT initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

Then connect your local repository:

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/terramind.git
git branch -M main
git push -u origin main
```

### Step 3: Verify Repository

Visit your repository at: `https://github.com/YOUR_USERNAME/terramind`

You should see:
- README.md with full documentation
- All source code files
- Supabase Edge Functions in the repository

---

## Environment Configuration

### Required Environment Variables

Create a `.env` file (already in `.gitignore`):

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Where to find these values:**
1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy "Project URL" as `VITE_SUPABASE_URL`
5. Copy "anon public" key as `VITE_SUPABASE_ANON_KEY`

### Optional Environment Variables

For Gemini AI chat (configured in Supabase, not locally):

```bash
GEMINI_API_KEY=your-gemini-api-key
```

**Note:** Edge Functions automatically have access to Supabase environment variables.

---

## Frontend Deployment (Vercel)

Vercel provides the best hosting for Vite + React applications.

### Step 1: Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### Step 2: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository (`terramind`)
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

6. Click "Deploy"

### Step 3: Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (Select your account)
# - Link to existing project? No
# - Project name? terramind
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# Deploy to production
vercel --prod
```

### Step 4: Configure Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

Your app will be live at:
- `https://terramind.vercel.app` (default)
- `https://your-custom-domain.com` (if configured)

---

## Backend Status (Supabase)

### Already Deployed ✅

The following are already active in your Supabase project:

#### Database Schema
- ✅ `users` table with RLS
- ✅ `land_plots` table with RLS
- ✅ `land_analytics` table with RLS
- ✅ `recommendations` table with RLS
- ✅ `impact_logs` table with RLS
- ✅ All indexes and triggers

#### Edge Functions
- ✅ `analyze-land` - Land analysis and NDVI calculation
- ✅ `recommend-crop` - AI-powered recommendations
- ✅ `track-progress` - Progress tracking
- ✅ `chat-regen` - Gemini AI assistant

#### Authentication
- ✅ Email/password authentication enabled
- ✅ Row Level Security configured
- ✅ User profiles automated

### No Additional Backend Deployment Needed

All backend infrastructure is managed by Supabase and already deployed!

---

## CI/CD with GitHub Actions

### Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy TerraMind

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Type check
      run: npm run typecheck

    - name: Lint
      run: npm run lint

    - name: Build
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

### Configure GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add these secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VERCEL_TOKEN` (from Vercel account settings)
   - `VERCEL_ORG_ID` (from Vercel project settings)
   - `VERCEL_PROJECT_ID` (from Vercel project settings)

### Commit and Push

```bash
git add .github/workflows/deploy.yml
git commit -m "Add CI/CD pipeline"
git push
```

Now every push to `main` will automatically:
1. Run type checking
2. Run linting
3. Build the project
4. Deploy to Vercel (if tests pass)

---

## Optional API Keys

### Gemini API Key (For AI Chat)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key

**Add to Supabase Edge Functions:**

Since Edge Functions are already deployed, the Gemini API key is managed through Supabase environment variables. The chat will work with limited functionality without it.

### SentinelHub API (For Real Satellite Data)

1. Sign up at [sentinel-hub.com](https://www.sentinel-hub.com/)
2. Create a configuration
3. Get your instance ID
4. Update the `analyze-land` Edge Function code

### NASA POWER API

No API key required - publicly accessible:
- API: `https://power.larc.nasa.gov/api/temporal/daily/point`
- Documentation: [NASA POWER Docs](https://power.larc.nasa.gov/docs/services/api/)

### SoilGrids API

No API key required - publicly accessible:
- API: `https://rest.soilgrids.org/query`
- Documentation: [SoilGrids API](https://www.soilgrids.org/api/)

---

## Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Database schema deployed (already done)
- [ ] Edge Functions deployed (already done)
- [ ] Code committed to GitHub

### Frontend Deployment
- [ ] Repository pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added to Vercel
- [ ] First deployment successful
- [ ] Custom domain configured (optional)

### Testing
- [ ] Sign up / Sign in works
- [ ] Can create land plots
- [ ] Analysis functions work
- [ ] Recommendations generate
- [ ] Chat interface loads (works with/without Gemini key)
- [ ] All pages are mobile responsive

### Production
- [ ] GitHub Actions workflow configured (optional)
- [ ] Monitoring enabled in Vercel
- [ ] Supabase logs monitored
- [ ] Error tracking configured (optional: Sentry)

---

## Monitoring & Maintenance

### Vercel Dashboard
Monitor:
- Deployment status
- Build logs
- Analytics (page views, performance)
- Error rates

### Supabase Dashboard
Monitor:
- Database usage
- Edge Function invocations
- API requests
- Authentication metrics

### Logs

**View Edge Function Logs:**
```bash
# In Supabase Dashboard
Go to Edge Functions → Select function → Logs
```

**View Build Logs:**
```bash
# In Vercel Dashboard
Go to Deployments → Select deployment → Build Logs
```

---

## Troubleshooting

### Build Fails on Vercel

**Error: Missing environment variables**
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel project settings

**Error: TypeScript errors**
```bash
npm run typecheck
# Fix any type errors locally first
```

### Runtime Errors

**Error: "Missing authorization header"**
- User needs to sign in
- Session may have expired

**Error: "Failed to fetch"**
- Check CORS configuration in Edge Functions
- Verify Supabase URL is correct

### Edge Function Errors

**Function not responding**
- Check Edge Function logs in Supabase Dashboard
- Verify function is deployed
- Check for runtime errors

---

## Scaling Considerations

### Database
- Supabase free tier: 500MB database, 2GB bandwidth
- Upgrade to Pro for production ($25/month)
- Consider read replicas for high traffic

### Edge Functions
- Free tier: 500,000 invocations/month
- Upgrade if you exceed limits
- Optimize function code for performance

### Frontend
- Vercel free tier: Unlimited bandwidth for personal projects
- Upgrade to Pro for commercial use ($20/month/member)

---

## Security Checklist

### Before Going Live

- [ ] RLS policies tested and working
- [ ] No API keys committed to repository
- [ ] Supabase service role key never exposed to frontend
- [ ] CORS properly configured
- [ ] Rate limiting considered (Vercel + Supabase)
- [ ] SSL/HTTPS enabled (automatic with Vercel)
- [ ] Environment variables secured

### Regular Maintenance

- [ ] Update dependencies monthly
- [ ] Monitor Supabase dashboard for unusual activity
- [ ] Review Edge Function logs weekly
- [ ] Backup database regularly (Supabase does daily backups)
- [ ] Keep API keys rotated (especially Gemini)

---

## Support & Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)

### Community
- [Supabase Discord](https://discord.supabase.com/)
- [Vercel Discord](https://vercel.com/discord)

### Issues
For TerraMind-specific issues, open an issue on GitHub:
`https://github.com/YOUR_USERNAME/terramind/issues`

---

**Congratulations! Your TerraMind application is now deployed and ready to help regenerate land worldwide.**
