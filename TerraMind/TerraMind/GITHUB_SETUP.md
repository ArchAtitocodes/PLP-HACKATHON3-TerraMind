# GitHub Repository Setup for TerraMind

This guide provides exact commands to push your TerraMind project to GitHub.

## Prerequisites

- Git installed on your system
- GitHub account created
- GitHub CLI installed (optional but recommended)

## Quick Setup (5 Minutes)

### Option 1: Using GitHub CLI (Recommended - Easiest)

```bash
# 1. Install GitHub CLI if not already installed
# macOS: brew install gh
# Windows: winget install --id GitHub.cli
# Linux: See https://github.com/cli/cli/blob/trunk/docs/install_linux.md

# 2. Login to GitHub
gh auth login
# Follow the prompts to authenticate

# 3. Navigate to your project directory
cd /tmp/cc-agent/58725218/project

# 4. Initialize git (if not already done)
git init

# 5. Add all files
git add .

# 6. Create initial commit
git commit -m "Initial commit: TerraMind - AI-Powered Land Regeneration Platform

- Complete database schema with RLS
- Supabase Edge Functions for land analysis, recommendations, progress tracking
- Gemini AI chat assistant
- React frontend with authentication
- Beautiful UI with Tailwind CSS
- Comprehensive documentation"

# 7. Create GitHub repository and push (all in one command!)
gh repo create terramind --public --source=. --remote=origin --push --description "AI-Powered Land Regeneration Assistant - Monitor and improve land health with satellite data analysis, ML recommendations, and Gemini AI guidance"

# DONE! Your repository is live at: https://github.com/YOUR_USERNAME/terramind
```

### Option 2: Using Git + GitHub Web Interface

#### Step 1: Create Repository on GitHub

1. Go to: https://github.com/new
2. Fill in:
   - **Repository name**: `terramind`
   - **Description**: `AI-Powered Land Regeneration Assistant - Monitor and improve land health with satellite data analysis, ML recommendations, and Gemini AI guidance`
   - **Visibility**: Public (or Private if you prefer)
   - **Important**: Do NOT check any boxes (no README, no .gitignore, no license)
3. Click **Create repository**

#### Step 2: Push Local Code to GitHub

```bash
# 1. Navigate to project directory
cd /tmp/cc-agent/58725218/project

# 2. Initialize git repository (if not done)
git init

# 3. Add all files
git add .

# 4. Create initial commit
git commit -m "Initial commit: TerraMind - AI-Powered Land Regeneration Platform"

# 5. Add GitHub remote (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/terramind.git

# 6. Rename branch to main (if needed)
git branch -M main

# 7. Push to GitHub
git push -u origin main

# DONE! Visit https://github.com/YOUR_USERNAME/terramind to see your repository
```

## Verify Your Repository

After pushing, verify these files exist in your GitHub repository:

```
✓ README.md - Complete project documentation
✓ DEPLOYMENT.md - Deployment instructions
✓ package.json - Dependencies and scripts
✓ src/ - All source code
  ✓ components/ - React components
  ✓ contexts/ - Auth context
  ✓ lib/ - API and Supabase utilities
✓ supabase/ - Database migrations (auto-created during setup)
```

## Update README with Repository Link

After creating the repository, update the README:

```bash
# Add repository link section to README
echo "

---

## Repository

**GitHub**: https://github.com/YOUR_USERNAME/terramind

Clone this repository:
\`\`\`bash
git clone https://github.com/YOUR_USERNAME/terramind.git
cd terramind
npm install
\`\`\`
" >> README.md

# Commit and push the update
git add README.md
git commit -m "Add repository link to README"
git push
```

## Common Issues & Solutions

### Issue: "Permission denied (publickey)"

**Solution**: Set up SSH key or use HTTPS
```bash
# Use HTTPS instead of SSH
git remote set-url origin https://github.com/YOUR_USERNAME/terramind.git
```

### Issue: "Repository not found"

**Solutions**:
1. Verify the repository name is exactly `terramind`
2. Check you're using the correct GitHub username
3. Ensure the repository was created successfully

### Issue: "Updates were rejected"

**Solution**: Pull first, then push
```bash
git pull origin main --rebase
git push origin main
```

## Next Steps After GitHub Setup

### 1. Add Repository Topics

On GitHub, add these topics to help others discover your project:
- `ai`
- `machine-learning`
- `agriculture`
- `sustainability`
- `regenerative-agriculture`
- `supabase`
- `react`
- `typescript`
- `gemini-ai`
- `satellite-data`

Go to your repository → About → Settings icon → Add topics

### 2. Enable GitHub Pages (Optional)

For project documentation:
1. Settings → Pages
2. Source: Deploy from a branch
3. Branch: main, /docs folder
4. Save

### 3. Set Up Branch Protection (Recommended)

1. Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - Require pull request reviews before merging
   - Require status checks to pass before merging

### 4. Add Collaborators (If Team Project)

1. Settings → Collaborators
2. Add people → Enter GitHub username
3. Send invitation

## Deployment to Vercel

Once your code is on GitHub:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your GitHub repository and deploy
vercel --prod

# Or use Vercel dashboard:
# 1. Go to vercel.com
# 2. Import your GitHub repository
# 3. Configure environment variables
# 4. Deploy
```

See DEPLOYMENT.md for detailed deployment instructions.

## Environment Variables Setup

Before deploying, ensure you have these configured:

```env
# Required for deployment
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional for AI chat
GEMINI_API_KEY=your-gemini-api-key
```

**Never commit `.env` files to GitHub** - They're already in `.gitignore`

## Repository Badges (Optional)

Add these badges to your README for a professional look:

```markdown
![Build Status](https://github.com/YOUR_USERNAME/terramind/actions/workflows/deploy.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue)
![React](https://img.shields.io/badge/React-18.3-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)
```

## Maintenance Commands

### Update Dependencies
```bash
npm update
git add package*.json
git commit -m "Update dependencies"
git push
```

### Create New Feature Branch
```bash
git checkout -b feature/new-feature-name
# Make changes
git add .
git commit -m "Add new feature"
git push -u origin feature/new-feature-name
# Create pull request on GitHub
```

### Tag Releases
```bash
git tag -a v1.0.0 -m "Release version 1.0.0 - MVP Launch"
git push origin v1.0.0
```

## Support

If you encounter any issues:

1. Check the GitHub repository: https://github.com/YOUR_USERNAME/terramind/issues
2. Review the DEPLOYMENT.md file
3. Check Supabase logs in your dashboard
4. Review the README.md troubleshooting section

## Congratulations!

Your TerraMind repository is now on GitHub and ready to be deployed. The world can now benefit from your AI-powered land regeneration platform!

Next steps:
1. ✅ Code on GitHub
2. ⬜ Deploy to Vercel (see DEPLOYMENT.md)
3. ⬜ Share with the community
4. ⬜ Start regenerating land!

---

**Repository Link**: https://github.com/YOUR_USERNAME/terramind
**Live Demo** (after Vercel deployment): https://terramind.vercel.app
