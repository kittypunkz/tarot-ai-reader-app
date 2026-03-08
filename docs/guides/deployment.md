# Deployment Guide

## Quick Deploy

### 1. Backend - Render.com

**Option A: One-Click Deploy (Recommended)**
1. Fork this repository to your GitHub account
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "Blueprints" → "New Blueprint Instance"
4. Connect your GitHub repo
5. Set the required environment variables (see below)

**Option B: Manual Setup**
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn src.main:app --host 0.0.0.0 --port $PORT`
   - **Python Version**: 3.12

**Required Environment Variables:**
```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=google/gemma-2-9b-it:free
DATABASE_URL=postgresql://...  # Auto-set if using Render PostgreSQL
APP_URL=https://your-frontend-url.vercel.app
ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
RATE_LIMIT_REQUESTS_PER_MINUTE=10
```

### 2. Frontend - Vercel

1. Go to [Vercel](https://vercel.com/)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
4. Add Environment Variable:
   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   ```
5. Deploy!

---

## CI/CD Setup

### GitHub Secrets Configuration

Go to **Settings → Secrets and variables → Actions** and add:

**For Backend Deployment (Render):**
- `RENDER_SERVICE_ID`: Your Render service ID (from Render Dashboard URL)
- `RENDER_API_KEY`: Create at [Render API Keys](https://dashboard.render.com/u/settings#api-keys)

**For Frontend Deployment (Vercel):**
- `VERCEL_TOKEN`: Create at [Vercel Tokens](https://vercel.com/account/tokens)
- `VERCEL_ORG_ID`: From `vercel.json` or Vercel project settings
- `VERCEL_PROJECT_ID`: From `vercel.json` or Vercel project settings

To get Vercel IDs locally:
```bash
cd frontend
npx vercel link
# Then check .vercel/project.json
```

---

## Deployment Workflows

### Automatic Deployments
- **Push to `main` branch** → Triggers both frontend and backend deployments
- **Pull Requests** → Runs tests and builds (no deployment)
- **Path-based**: Only deploys services that changed

### Manual Deployments
```bash
# Backend
curl -X POST "https://api.render.com/v1/services/$SERVICE_ID/deploys" \
  -H "authorization: Bearer $RENDER_API_KEY"

# Frontend
vercel --prod
```

---

## Production Checklist

- [ ] Set `RATE_LIMIT_REQUESTS_PER_MINUTE` appropriately
- [ ] Configure CORS (`ALLOWED_ORIGINS`) for your domain
- [ ] Use PostgreSQL instead of SQLite (auto with Render Blueprint)
- [ ] Set up monitoring (Render has built-in logs)
- [ ] Configure custom domain (optional)
- [ ] Enable HTTPS (auto on both Vercel and Render)

---

## Troubleshooting

### Backend
- **Build fails**: Check Python version (3.12+)
- **CORS errors**: Verify `ALLOWED_ORIGINS` matches your frontend URL
- **Database errors**: Ensure `DATABASE_URL` is set correctly

### Frontend
- **API 404**: Verify `NEXT_PUBLIC_API_URL` is correct
- **Build fails**: Check for TypeScript errors with `npm run build` locally

---

## Alternative Platforms

| Platform | Frontend | Backend | Database |
|----------|----------|---------|----------|
| **Railway** | ✅ | ✅ | ✅ PostgreSQL |
| **Fly.io** | ✅ | ✅ | ✅ PostgreSQL |
| **Netlify** | ✅ | ❌ | ❌ |
| **AWS** | S3/CloudFront | ECS/Fargate | RDS |

### Railway Alternative
```yaml
# railway.yaml
build:
  builder: NIXPACKS

deploy:
  startCommand: cd backend && uvicorn src.main:app --host 0.0.0.0 --port $PORT
```
