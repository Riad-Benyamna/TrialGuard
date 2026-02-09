# TrialGuard

**Clinical trial risk analysis powered by Google Gemini 3.0**

TrialGuard is a production-ready web application that uses cutting-edge AI to identify protocol design flaws before clinical trials begin, potentially saving millions in wasted investment.

![Status](https://img.shields.io/badge/status-production--ready-green)
![Python](https://img.shields.io/badge/python-3.11+-blue)
![React](https://img.shields.io/badge/react-18.2+-blue)
![Free Deploy](https://img.shields.io/badge/deploy-free-brightgreen)

## Features

### Intelligent Risk Analysis

- **AI-Powered Analysis**: Leverages Gemini 3.0 Pro for deep protocol analysis
- **Historical Comparison**: Compares against 20+ curated historical trials
- **Quantified Risk Scores**: Provides 0-100 risk scores with confidence levels
- **Actionable Recommendations**: Prioritized recommendations with cost estimates

### Beautiful User Experience

- **Animated Dashboard**: Circular progress indicators with color gradients
- **Interactive Timeline**: Visual timeline of risk findings
- **Real-time Progress**: Server-Sent Events for live analysis updates
- **Chat Assistant**: Interactive Q&A about analysis results

### Production-Ready Architecture

- **FastAPI Backend**: Async Python with proper error handling
- **React Frontend**: Modern React 18 with Vite
- **Docker Containerized**: Easy deployment to any cloud platform
- **Comprehensive Testing**: Unit and integration tests included

## Getting Started

### Prerequisites

- Gemini API key ([Get free key here](https://aistudio.google.com/app/apikey))

### Quickest Way: Deploy Free (Recommended)

Deploy to **Render** (free tier) in 2 minutes:

1. **Create Render account** - [render.com](https://render.com)
2. **Connect this GitHub repo**
3. **Add environment variable:**
   - Key: `GEMINI_API_KEY`
   - Value: Your Gemini API key
4. **Deploy** - Takes ~2 minutes

That's it! Your app is live online.

### Alternative Free Deployments

**Railway** ([railway.app](https://railway.app))

- Same process as Render
- Very user-friendly

**Vercel** (Frontend) + **Render/Railway** (Backend)

- Split deployment for more control

### Local Development (Optional)

For development work:

```bash
# Clone and setup
git clone <your-repo-url>
cd trialguard

# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your GEMINI_API_KEY
python -m app.main

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Usage Guide

### 1. Input Protocol Data

**Option A: PDF Upload**

- Click "Upload Protocol PDF"
- Drag and drop your protocol document (max 50MB)
- Wait for AI extraction (~15-30 seconds)
- Review and edit extracted data

**Option B: Manual Entry**

- Click "Enter Manually"
- Fill out multi-step form:
  - Basic Information (trial name, sponsor, phase)
  - Study Design (design type, blinding, placebo)
  - Patient Population (inclusion/exclusion criteria)
  - Statistical Plan (sample size, endpoints)
  - Safety Monitoring

### 2. Analyze Protocol

- Click "Analyze Protocol"
- Watch real-time progress updates
  - Searching historical database
  - Analyzing with AI
  - Generating recommendations
- Analysis completes in 30-60 seconds

### 3. Review Results

**Risk Score Dashboard:**

- Overall risk score (0-100 with color coding)
- Category breakdown (Historical, Safety, Design)
- Risk level: Low (<30), Medium (30-60), High (>60)

**Findings Timeline:**

- Chronological list of identified risks
- Severity indicators (Low, Medium, High, Critical)
- Evidence from historical trials
- Quantified impacts

**Historical Comparison:**

- Side-by-side comparison with failed trials
- Color-coded match indicators
- Similarity scores

**Recommendations:**

- Prioritized action items
- Expected risk reduction
- Cost estimates
- Implementation timelines

### 4. Chat with AI

- Click chat icon (bottom right)
- Ask questions about the analysis:
  - "What's the biggest risk?"
  - "How can I reduce failure risk?"
  - "Why did similar trials fail?"
  - "What would recommendations cost?"

## Architecture

### Backend (FastAPI + Python)

```
backend/
├── app/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration management
│   ├── api/                 # API endpoints
│   │   ├── protocol.py      # Protocol parsing/validation
│   │   ├── analysis.py      # Risk analysis
│   │   └── chat.py          # Chat interface
│   ├── services/            # Business logic
│   │   ├── gemini_service.py      # Gemini API wrapper
│   │   ├── historical_db.py       # Database queries
│   │   └── risk_engine.py         # Risk calculations
│   ├── models/              # Pydantic models
│   └── data/                # Historical trials database
└── requirements.txt
```

### Frontend (React + Vite)

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── analysis/        # Dashboard components
│   │   ├── protocol/        # Input components
│   │   ├── chat/           # Chat components
│   │   └── common/         # Reusable components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utilities
│   └── App.jsx             # Main application
├── package.json
└── vite.config.js
```

## Configuration

### Environment Variables (Set these on your hosting platform)

**Required:**

```
GEMINI_API_KEY=your_api_key_from_aistudio.google.com
```

**Optional:**

```
DEBUG=false
GEMINI_RATE_LIMIT_RPM=60
MAX_UPLOAD_SIZE_MB=50
```

**On Render/Railway:**

- Go to Environment Variables section
- Add `GEMINI_API_KEY` and paste your key
- Deploy will automatically restart

### API Rate Limits

- **Free Tier**: 60 requests per minute
- **Paid Tier**: 1000 requests per minute

Cost estimates:

- Protocol parsing: ~$0.03 per protocol
- Risk analysis: ~$0.05-0.10 per analysis
- Chat message: ~$0.002 per message

## Database Structure

The historical trials database contains 20 curated trials with:

**Distribution:**

- Oncology: 8 trials
- Psychiatry: 7 trials
- Cardiology: 5 trials

**Failure Modes:**

- High placebo response: 4 trials
- Pharmacogenomic variability: 3 trials
- Biomarker selection failure: 5 trials
- Safety/tolerability: 3 trials
- Endpoint choice issues: 2 trials
- Statistical power inadequacy: 3 trials

Each trial includes:

- Root cause analysis with quantified impacts
- Counterfactual analysis (what would have worked)
- Cost quantification
- Actionable lessons learned
- Similarity matching criteria

## Testing

**Backend Tests:**

```bash
cd backend
pytest
```

**Frontend Tests:**

```bash
cd frontend
npm test
```

## Deployment Guide

### Easiest: Render (Recommended)

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New Service" → Select "Web Service"
4. Connect this repository
5. Set environment variables:
   - `GEMINI_API_KEY` = Your API key
6. Click "Deploy"

Render handles everything - both frontend and backend deploy in ~2 minutes.

### Alternative: Railway

1. Go to [railway.app](https://railway.app)
2. Click "Create Project"
3. Select "Deploy from GitHub"
4. Add environment variables in dashboard
5. Deploy - takes ~3 minutes

### Alternative: Vercel + Render

**Frontend on Vercel:**

- Push to GitHub
- Go to [vercel.com](https://vercel.com)
- Import project
- Set `VITE_API_URL` to your Render backend URL
- Deploy

**Backend on Render:**

- Follow Render instructions above

### Docker (Advanced)

```bash
docker-compose up -d
```

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Powered by [Google Gemini 3.0](https://ai.google.dev/)
- Historical trial data curated from ClinicalTrials.gov and published literature
- Built for the [Hackathon Name] hackathon

## Troubleshooting

**API Key Errors?**

- Get free Gemini API key: https://aistudio.google.com/app/apikey
- Make sure you've set `GEMINI_API_KEY` in your deployment platform

**Deployment Fails?**

- Check that `GEMINI_API_KEY` environment variable is set
- Ensure requirements.txt and package.json are in root directories

**Chat not working?**

- Backend needs to be running
- Check that frontend environment variable points to correct backend URL

## Support

For issues:

- Open a GitHub issue
- Check [deployment troubleshooting](#troubleshooting) above

---

**Built to improve clinical trial success rates and accelerate drug development**
