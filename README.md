# TrialGuard

**Clinical trial risk analysis powered by Google Gemini 3.0**

TrialGuard is a production-ready web application that uses cutting-edge AI to identify protocol design flaws before clinical trials begin, potentially saving millions in wasted investment.

![Status](https://img.shields.io/badge/status-production--ready-green)
![Live](https://img.shields.io/badge/live-https%3A%2F%2Ftrialguard.onrender.com%2F-blue)
![Python](https://img.shields.io/badge/python-3.11+-blue)
![React](https://img.shields.io/badge/react-18.2+-blue)

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
- **Docker Containerized**: Easy deployment to any cloud platform (currently running on Render)
- **Comprehensive Testing**: Unit and integration tests included

## Getting Started

### Access the Live Application

TrialGuard is fully deployed and ready to use:

**Live URL:** https://trialguard.onrender.com/

No setup required - just visit the link, upload a clinical trial protocol, and get instant AI-powered risk analysis!

### About This Repository

This is the source code for TrialGuard. If you want to:

- **Use the app**: Visit https://trialguard.onrender.com/
- **Contribute code**: Fork this repo and submit a pull request
- **Your own instance**: See [Customization](#customization) section

### Customization / Local Development

To modify TrialGuard or run locally:

```bash
# Clone and setup
git clone https://github.com/Riad-Benyamna/TrialGuard.git
cd trialguard

# Backend
cd backend
pip install -r requirements.txt
cp ../.env.example .env
# Edit .env with your GEMINI_API_KEY
python -m uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173 once both are running.

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

**For custom deployments:**

- Set `GEMINI_API_KEY` in your hosting platform's environment variables
- Most platforms auto-restart after environment updates

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

## Customization / Self-Hosting

### Deploy Your Own Instance

If you want to run your own instance:

1. **Fork this repository**
2. **Connect to Render:** [render.com](https://render.com)
   - New Service → Web Service
   - Connect your fork
   - Add `GEMINI_API_KEY` environment variable
   - Deploy (~2 minutes)
3. **Your custom URL is ready!**

### Docker Deployment

```bash
docker build -t trialguard .
docker run -e GEMINI_API_KEY=your_key -p 8000:8000 trialguard
```

Visit http://localhost:8000

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
