# Google Cloud Platform (GCP) Setup Guide

## 🤔 Why I Initially Recommended Against GCP

### 1. **Complexity vs. Your Project Size**
Your tarot app is a **small-medium project** with:
- Single backend service
- Single frontend app  
- Standard PostgreSQL database

GCP is designed for **enterprise-scale** apps with:
- Multiple microservices
- Complex networking needs
- Compliance requirements
- Teams of developers

### 2. **Learning Curve**
| Platform | Time to First Deploy | Knowledge Required |
|----------|---------------------|-------------------|
| **Render + Supabase** | 15 minutes | Basic web concepts |
| **Google Cloud** | 2-4 hours | IAM, VPCs, APIs, Billing alerts |

### 3. **Pricing Complexity** ⚠️
GCP's pricing is **very flexible but complex**:
```
Cloud SQL: $7-20/mo (db-f1-micro to db-g1-small)
Cloud Run: $0 (first 2M requests), then $0.40/million
Cloud Build: $0 (first 120 mins/day), then $0.003/min
Cloud Storage: $0.02/GB
Load Balancer: $18/mo minimum
Egress: $0.12-0.23/GB
```

**Risk:** Easy to accidentally enable services that cost $$$.

### 4. **Credit Card Required**
GCP requires a credit card upfront, even for free tier.

---

## ✅ When Google Cloud IS the Right Choice

### Choose GCP if:
1. ✅ **You have $300 free credit** (90 days) - great for learning
2. ✅ **You need enterprise reliability** (99.99% SLA)
3. ✅ **You plan to scale big** (millions of users)
4. ✅ **You want unified billing** (everything in one place)
5. ✅ **You need advanced features** (BigQuery analytics, ML, etc.)
6. ✅ **Team has GCP experience** already

---

## 🚀 Complete GCP Setup for Your Tarot App

### Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        Google Cloud                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Cloud Load   │───▶│ Cloud Run    │───▶│ Cloud SQL    │  │
│  │ Balancer     │    │ (FastAPI)    │    │ PostgreSQL   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         ▲                                                   │
│         │                                                   │
│  ┌──────┴──────┐                                           │
│  │   Vercel    │  (Frontend - can stay on Vercel)          │
│  │  (Next.js)  │                                           │
│  └─────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Setup

### Step 1: Create GCP Project

```bash
# Install gcloud CLI
# Windows: https://cloud.google.com/sdk/docs/install#windows

# Login
gcloud auth login

# Create project
gcloud projects create tarot-app-prod --name="Ask The Tarot"
gcloud config set project tarot-app-prod

# Enable billing (required)
# Go to: https://console.cloud.google.com/billing
```

### Step 2: Enable APIs

```bash
# Enable required services
gcloud services enable sqladmin.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### Step 3: Create Cloud SQL Database

```bash
# Create PostgreSQL instance (Singapore region)
gcloud sql instances create tarot-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-southeast1 \
  --storage-type=SSD \
  --storage-size=10GB \
  --availability-type=zonal \
  --no-backup \
  --no-maintenance-window

# Set password
gcloud sql users set-password postgres \
  --instance=tarot-db \
  --password=YOUR_STRONG_PASSWORD

# Create database
gcloud sql databases create tarot --instance=tarot-db

# Get connection name
export DB_CONNECTION=$(gcloud sql instances describe tarot-db --format='value(connectionName)')
echo "Connection name: $DB_CONNECTION"
```

### Step 4: Store Secrets

```bash
# Store database URL
echo -n "postgresql+psycopg2://postgres:YOUR_PASSWORD@/tarot?host=/cloudsql/$DB_CONNECTION" | \
  gcloud secrets create database-url --data-file=-

# Store OpenRouter API key
echo -n "your-openrouter-api-key" | \
  gcloud secrets create openrouter-api-key --data-file=-

# Grant Cloud Run access to secrets
gcloud secrets add-iam-policy-binding database-url \
  --member="serviceAccount:tarot-app-prod@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding openrouter-api-key \
  --member="serviceAccount:tarot-app-prod@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 5: Setup Cloud Build (CI/CD)

Create `cloudbuild.yaml`:

```yaml
steps:
  # Step 1: Run tests
  - name: 'python:3.12-slim'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        cd backend
        pip install -r requirements.txt
        pip install pytest
        PYTHONPATH=. pytest tests/ -v

  # Step 2: Build Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - 'gcr.io/$PROJECT_ID/tarot-backend:$COMMIT_SHA'
      - '-f'
      - 'backend/Dockerfile'
      - './backend'

  # Step 3: Push to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'gcr.io/$PROJECT_ID/tarot-backend:$COMMIT_SHA'

  # Step 4: Run database migrations
  - name: 'gcr.io/cloud-builders/gcloud'
    entrypoint: bash
    args:
      - '-c'
      - |
        cd backend
        pip install -r requirements.txt
        export DATABASE_URL=$(gcloud secrets versions access latest --secret=database-url)
        alembic upgrade head

  # Step 5: Deploy to Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'tarot-backend'
      - '--image=gcr.io/$PROJECT_ID/tarot-backend:$COMMIT_SHA'
      - '--region=asia-southeast1'
      - '--platform=managed'
      - '--allow-unauthenticated'
      - '--set-secrets=DATABASE_URL=database-url:latest,OPENROUTER_API_KEY=openrouter-api-key:latest'
      - '--set-env-vars=APP_URL=https://your-frontend.vercel.app,ALLOWED_ORIGINS=https://your-frontend.vercel.app'
      - '--memory=512Mi'
      - '--cpu=1'
      - '--concurrency=80'
      - '--max-instances=10'
      - '--min-instances=0'

images:
  - 'gcr.io/$PROJECT_ID/tarot-backend:$COMMIT_SHA'
```

### Step 6: Create Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Set Python path
ENV PYTHONPATH=/app

# Run migrations and start server
CMD exec uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8080}
```

### Step 7: Setup GitHub Integration

```bash
# Connect Cloud Build to GitHub
gcloud builds connections create github tarot-connection \
  --region=asia-southeast1

# Create trigger for main branch
gcloud builds triggers create github \
  --name=tarot-backend-deploy \
  --repo-name=your-repo-name \
  --repo-owner=your-github-username \
  --branch-pattern='^main$' \
  --build-config=cloudbuild.yaml
```

### Step 8: Configure GitHub Actions (Alternative)

If you prefer GitHub Actions over Cloud Build:

```yaml
# .github/workflows/deploy-gcp.yml
name: Deploy to Google Cloud

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: 'read'
      id-token: 'write'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Google Auth
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - name: Setup Cloud SDK
        uses: google-github-actions/setup-gcloud@v2
      
      - name: Deploy to Cloud Run
        uses: google-github-actions/deploy-cloudrun@v2
        with:
          service: tarot-backend
          region: asia-southeast1
          source: ./backend
          env_vars: |
            APP_URL=https://your-frontend.vercel.app
            ALLOWED_ORIGINS=https://your-frontend.vercel.app
          secrets: |
            DATABASE_URL=database-url:latest
            OPENROUTER_API_KEY=openrouter-api-key:latest
```

---

## 💰 GCP Cost Breakdown

### Free Tier (Always Free)
```
Cloud Run:     2M requests/month + 360,000 GB-seconds
Cloud Build:   120 build minutes/day
Cloud Storage: 5GB
```

### Estimated Monthly Costs (Small App)
```
Cloud SQL (db-f1-micro):    ~$7-10/month
Cloud Run (within limits):  $0
Cloud Build (within limits): $0
Cloud Load Balancer:        $18/month (if used)
Egress (10GB):              ~$1-2/month
─────────────────────────────────────
Total:                      ~$25-30/month
```

### With $300 Credit
**You can run for ~10-12 months for free**, then:
- Downgrade to db-f1-micro (always free tier doesn't apply to Cloud SQL)
- Or migrate to cheaper alternative

---

## ⚖️ GCP vs. Render/Supabase Comparison

| Feature | Google Cloud | Render + Supabase |
|---------|--------------|-------------------|
| **Setup Time** | 2-4 hours | 15 minutes |
| **Learning Curve** | Steep | Gentle |
| **Free Tier Duration** | 90 days ($300) | Forever |
| **Cost After Free** | $25-30/mo | $0-25/mo |
| **Reliability** | 99.99% SLA | 99.9% (good enough) |
| **Singapore Region** | ✅ Yes | ⚠️ Supabase only |
| **Auto CI/CD** | ✅ Cloud Build/GitHub | ✅ GitHub Actions |
| **Credit Card** | Required | Not required |
| **Scalability** | Enterprise-grade | Startup-friendly |
| **Vendor Lock-in** | Higher | Lower |
| **Documentation** | Extensive (overwhelming) | Concise |

---

## 🎯 My Recommendation

### Use Google Cloud if:
1. **You want to learn GCP** for career/skills ($300 credit is great for this!)
2. **You're building a commercial product** and need enterprise reliability
3. **You have a team** with GCP experience
4. **You need advanced features** (BigQuery, ML, monitoring)
5. **You want everything in one place** (billing, IAM, security)

### Stick with Render + Supabase if:
1. **You want to ship fast** without infrastructure complexity
2. **You're a solo developer** or small team
3. **Cost predictability** is important (no surprise bills)
4. **You prefer simplicity** over configuration options
5. **No credit card** or billing surprises

---

## 🚀 Quick Decision Guide

```
Are you learning GCP for work/career?
    ├── YES → Use GCP (great learning opportunity!)
    └── NO → Continue...

Is this a commercial product with revenue?
    ├── YES → Consider GCP for reliability
    └── NO → Continue...

Do you need to deploy in the next hour?
    ├── YES → Use Render + Supabase
    └── NO → You could try GCP

Are you comfortable with:
    - IAM policies?
    - VPC networks?
    - Billing alerts?
    - Reading 100+ page docs?
    └── If NO → Use Render + Supabase
```

---

## 🔄 Migration Path

Good news: **You can migrate later!**

```
Start with: Render + Supabase
              ↓
When you outgrow: Export Supabase → Import to Cloud SQL
              ↓
Move backend: Render → Cloud Run (just change deploy target)
```

Your SQLAlchemy models work with both PostgreSQL instances without changes.

---

## Bottom Line

**Google Cloud is excellent** - just overkill for most small projects. If you have the $300 credit and want to learn, absolutely go for it! But if you just want to ship your tarot app quickly, Render + Supabase gets you there faster with less mental overhead.

**Best of both worlds:** Start with Render + Supabase, migrate to GCP later when you have users and revenue to justify the complexity.
