# TerraMind Quick Start Guide

Get TerraMind running in under 10 minutes!

## What You're Building

TerraMind is a complete AI-powered land regeneration platform with:
- Land plot management and monitoring
- NDVI/EVI vegetation analysis
- AI crop recommendations
- Gemini chat assistant
- Progress tracking over time

## 3-Step Setup

### Step 1: Configure Environment (2 minutes)

Create `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Get these values:**
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Settings → API → Copy Project URL and anon key

### Step 2: Install & Run (2 minutes)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173

### Step 3: Test the App (5 minutes)

1. **Sign Up**: Create an account
2. **Add Plot**: Click "Add Plot"
   - Name: "Test Farm"
   - Latitude: 40.7128
   - Longitude: -74.0060
   - Area: 10 hectares
3. **Analyze**: Click "Analyze Now"
4. **View Results**: See NDVI, soil quality, recommendations
5. **Chat**: Click "AI Assistant" and ask questions

Done! You're now running TerraMind locally.

## Backend Status

All backend services are already deployed:

✅ **Database**: Complete schema with RLS
✅ **Authentication**: Email/password ready
✅ **Edge Functions**: 4 APIs deployed
- `analyze-land` - Vegetation analysis
- `recommend-crop` - AI recommendations
- `track-progress` - Trend monitoring
- `chat-regen` - Gemini assistant

## Deploy to Production

### Push to GitHub (1 minute)

```bash
# Using GitHub CLI (easiest)
gh auth login
gh repo create terramind --public --source=. --push

# Or manually
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/terramind.git
git push -u origin main
```

### Deploy to Vercel (3 minutes)

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click "Deploy"

Your app will be live at: `https://terramind.vercel.app`

## Key Features Overview

### For Farmers
- Monitor multiple land plots
- Track vegetation health (NDVI)
- Get personalized crop recommendations
- Measure improvement over time

### For Consultants
- Data-driven advice
- Progress visualization
- Evidence-based recommendations
- Professional reporting

### For Researchers
- Satellite data integration
- Soil quality metrics
- Degradation risk assessment
- Impact measurement

## Understanding Your Data

### NDVI Score
- **0.6-0.8**: Healthy vegetation
- **0.3-0.6**: Moderate health
- **0.1-0.3**: Sparse vegetation
- **<0.1**: Degraded land

### Soil Quality
- **70-100**: Excellent
- **50-69**: Good
- **30-49**: Needs improvement
- **<30**: Critical

### Risk Levels
- **Low**: Keep current practices
- **Medium**: Monitor closely
- **High**: Intervention needed
- **Critical**: Urgent action required

## Example Workflow

### First Week
1. Add all your land plots
2. Run initial analysis on each
3. Review AI recommendations
4. Take "before" photos

### Monthly
1. Re-analyze each plot
2. Track progress metrics
3. Adjust practices based on recommendations
4. Chat with AI for specific questions

### Quarterly
1. Generate progress reports
2. Compare NDVI trends
3. Document improvements
4. Share success stories

## Chat Assistant Examples

Ask the AI:
- "What crops grow well in degraded soil?"
- "How do I improve my NDVI score?"
- "Explain my soil quality results"
- "What is regenerative agriculture?"
- "Should I plant cover crops?"

## API Endpoints

All available at: `https://your-project.supabase.co/functions/v1/`

```bash
# Analyze land
POST /analyze-land
{
  "plotId": "uuid",
  "useCoordinates": true
}

# Get recommendations
POST /recommend-crop
{
  "plotId": "uuid"
}

# Track progress
POST /track-progress
{
  "plotId": "uuid"
}

# Chat with AI
POST /chat-regen
{
  "message": "How can I improve soil health?",
  "plotId": "optional-uuid"
}
```

## Optional Enhancements

### Add Gemini API Key
For full AI chat functionality:
1. Get key: [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to Supabase Edge Function environment

### Real Satellite Data
Integrate SentinelHub:
1. Sign up: [sentinel-hub.com](https://www.sentinel-hub.com/)
2. Update `analyze-land` function
3. Process real satellite imagery

### Custom Domain
On Vercel:
1. Project Settings → Domains
2. Add your domain
3. Update DNS records

## Troubleshooting

### Can't Sign In
- Clear browser cache
- Check console for errors
- Verify Supabase URL is correct

### Analysis Not Working
- Check network tab for API errors
- Verify you own the plot
- Check Edge Function logs in Supabase

### Chat Not Responding
- Works without Gemini key (limited)
- Check function deployment status
- Verify network connection

## Resources

- **Full Documentation**: See README.md
- **Deployment Guide**: See DEPLOYMENT.md
- **GitHub Setup**: See GITHUB_SETUP.md
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)

## Support

Need help?
1. Check the README troubleshooting section
2. Review Supabase logs
3. Check browser console
4. Open GitHub issue

## What's Next?

After basic setup:
1. [ ] Add real satellite imagery integration
2. [ ] Build interactive map view (Mapbox)
3. [ ] Add image upload for analysis
4. [ ] Create mobile app version
5. [ ] Implement community features
6. [ ] Add carbon tracking
7. [ ] Build consultant collaboration tools

## Success Metrics

Track your impact:
- Number of plots monitored
- Average NDVI improvement
- Soil quality gains
- Hectares under regeneration
- Community members helped

## Community

Share your success:
- Tweet with #TerraMind
- Share progress screenshots
- Write blog posts
- Help other farmers
- Contribute code improvements

---

**You're now ready to start regenerating land with AI!**

Questions? Check the full README.md or open an issue on GitHub.

Happy regenerating! 🌱
