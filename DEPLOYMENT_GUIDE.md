# TrialGuard Deployment Guide

Deploy TrialGuard online for free in minutes.

## Quick Deployment (Recommended: Render)

### 1. Get API Key

- Go to https://aistudio.google.com/app/apikey
- Sign in with Google
- Click "Create API Key"
- Copy the key (starts with "AIza...")

### 2. Deploy on Render

1. Sign up at [render.com](https://render.com) with GitHub
2. Click "New Service" → select "Web Service"
3. Select your GitHub repository
4. Configure:
   - **Name**: trialguard
   - **Branch**: main
   - **Runtime**: Python 3.11
   - **Build Command**: (leave default)
   - **Start Command**: python -m app.main
5. Add Environment Variables:
   - Click "Advanced"
   - Add Variable:
     - **Key**: `GEMINI_API_KEY`
     - **Value**: Paste your API key from step 1
6. Click "Deploy"

Render will:

- Build your application
- Start the backend on a public URL
- Deploy frontend automatically
- Takes ~2-3 minutes

Your app will be live at a URL like `https://trialguard-xxxxx.onrender.com`

## Alternative: Railway

1. Sign up at [railway.app](https://railway.app) with GitHub
2. Click "Create New Project"
3. Select "Deploy from GitHub repo"
4. Find and select your repository
5. In "Variables" section, add:
   - **GEMINI_API_KEY** = Your API key
6. Click "Add Service" → Deploy
7. Done! Live in ~2 minutes

## Alternative: Vercel (Frontend) + Render (Backend)

### Deploy Backend on Render

Follow steps above (Render section)

### Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Import Project"
4. Select your repository
5. Set Build Settings:
   - **Framework**: Vite
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/dist`
6. In Environment Variables, add:
   - **VITE_API_URL** = Your Render backend URL (e.g., `https://trialguard-xxxxx.onrender.com`)
7. Deploy

Now:

- Frontend runs on Vercel
- Backend runs on Render
- They communicate seamlessly

## Testing Your Deployment

1. Visit your deployed URL
2. Upload a protocol PDF or enter data manually
3. Click "Analyze Protocol"
4. Wait for analysis to complete (~30-60 seconds)
5. View results, risk scores, and recommendations

## Costs

**Free Tier:**

- Render: Free tier includes 750+ hours/month (enough for always-on)
- Railway: $5/month free credit
- Vercel: Free frontend hosting
- Gemini API: Free tier (~15 requests/minute)

**Total Cost**: $0-5/month for production deployment

## Environment Variables Reference

Only one variable is required to deploy:

```
GEMINI_API_KEY=your_api_key_here
```

Optional variables:

- `DEBUG=false` - Set to true for verbose logging
- `GEMINI_RATE_LIMIT_RPM=60` - API rate limit
- `MAX_UPLOAD_SIZE_MB=50` - File upload limit
- `CORS_ORIGINS` - Allowed domains (set automatically by Render/Railway)

## Troubleshooting

### "API Key Invalid" Error

- Get a new key at https://aistudio.google.com/app/apikey
- Make sure you copy the entire key
- Check that it's set as `GEMINI_API_KEY` in environment variables

### "Build Failed"

- Check that your GitHub repo has both `frontend/` and `backend/` directories
- Verify all files were pushed correctly
- Check deployment logs for specific errors

### Site Takes Too Long to Load

- First request wakes up free tier server (can take 30s)
- Subsequent requests are instant
- Consider upgrading to paid tier if you need instant responses

### Chat Not Working

- Ensure backend is running (check Render/Railway dashboard)
- Verify frontend environment variable `VITE_API_URL` is set correctly
- Clear browser cache and reload

## Next Steps

1. **Monitor Usage**: Check Gemini API usage in [aistudio.google.com](https://aistudio.google.com)
2. **Upgrade if Needed**: Switch to paid Gemini tier for higher limits
3. **Add Custom Domain**: Render/Railway let you add custom domains
4. **Enable Analytics**: Monitor user activity and performance

## Support

For deployment issues:

- Check your platform's documentation (render.com/docs, railway.app/docs)
- Review deployment logs for specific errors
- Open a GitHub issue with your problem

---

**Your TrialGuard is now live.**
