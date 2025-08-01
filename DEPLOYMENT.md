# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **LiveKit Cloud Project**: Make sure your LiveKit project is active
3. **GitHub Repository**: Your code should be pushed to GitHub

## Step 1: Connect to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

## Step 2: Set Environment Variables

You need to set these environment variables in Vercel:

### From Vercel Dashboard:
1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

```
LIVEKIT_URL=wss://your-project-id.livekit.cloud
LIVEKIT_API_KEY=your_api_key_here
LIVEKIT_API_SECRET=your_api_secret_here
NEXT_PUBLIC_LK_URL=wss://your-project-id.livekit.cloud
```

### From CLI:
```bash
vercel env add LIVEKIT_URL
vercel env add LIVEKIT_API_KEY
vercel env add LIVEKIT_API_SECRET
vercel env add NEXT_PUBLIC_LK_URL
```

## Step 3: Deploy

### Option A: Deploy from CLI
```bash
vercel --prod
```

### Option B: Deploy from GitHub
1. Connect your GitHub repo to Vercel
2. Push to main branch
3. Vercel will auto-deploy

## Step 4: Verify Deployment

1. Check that your app loads at the Vercel URL
2. Test the "Start Call" button
3. Verify the agent connects (you'll need to run the Python agent separately)

## Important Notes

### Python Agent (Backend)
The Python agent (`sales_agent___cerebras_and_livekit.py`) runs separately and needs:
- Same environment variables
- Python environment with dependencies
- Access to LiveKit Cloud

### Environment Variables
- `LIVEKIT_URL`: WebSocket URL for LiveKit Cloud
- `LIVEKIT_API_KEY`: Your LiveKit API key
- `LIVEKIT_API_SECRET`: Your LiveKit API secret
- `NEXT_PUBLIC_LK_URL`: Same as LIVEKIT_URL (for frontend)

### Troubleshooting
- If the agent doesn't connect, check LiveKit Cloud dashboard
- Ensure your LiveKit project is active (not paused)
- Verify API keys are correct
- Check Vercel function logs for errors

## Next Steps

1. **Deploy Python Agent**: Consider deploying the Python agent to a separate service (Railway, Render, etc.)
2. **Domain**: Add a custom domain in Vercel settings
3. **Monitoring**: Set up monitoring for the LiveKit connection 