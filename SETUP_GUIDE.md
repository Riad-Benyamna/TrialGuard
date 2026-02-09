# TrialGuard Setup & Testing Guide

Complete guide to setting up, testing, and demoing TrialGuard for the hackathon.

## 🎯 Pre-Demo Checklist

### 1. Environment Setup

**Get Gemini API Key:**
```bash
# Visit: https://aistudio.google.com/app/apikey
# Sign in with Google account
# Click "Create API Key"
# Copy the key (starts with "AIza...")
```

**Configure Environment:**
```bash
cd c:\Users\speed\Documents\gemini\trialguard

# Copy environment template
cp .env.example .env

# Edit .env file and add your API key
# On Windows, use notepad:
notepad .env

# Or on Mac/Linux:
nano .env

# Replace: GEMINI_API_KEY=your_gemini_api_key_here
# With: GEMINI_API_KEY=AIzaSy...your-actual-key...
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Verify installation
python -c "import fastapi; import google.generativeai; print('✓ Dependencies installed')"

# Test Gemini API connection
python -c "import google.generativeai as genai; import os; from dotenv import load_dotenv; load_dotenv('../.env'); genai.configure(api_key=os.getenv('GEMINI_API_KEY')); print('✓ Gemini API connected')"

# Start backend server
python -m app.main
```

**Expected output:**
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Loading historical trials database...
INFO:     Historical database loaded successfully
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Test backend (in new terminal):**
```bash
# Health check
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","database_loaded":true,"trials_count":20,"gemini_configured":true}
```

### 3. Frontend Setup

**Open new terminal:**
```bash
cd frontend

# Install dependencies
npm install

# Verify installation
npm list react vite tailwindcss

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

**Expected output:**
```
  VITE v5.0.8  ready in 1234 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

**Open browser to http://localhost:3000**

You should see the TrialGuard landing page.

## 🧪 Testing Workflow

### Test 1: PDF Upload (Quick Test)

**Create a simple test PDF:**
```bash
# Use any PDF or create a simple text file converted to PDF
# For quick testing, use a plain text file with protocol-like content
```

**Simple test protocol text (save as test_protocol.txt, convert to PDF):**
```
Clinical Trial Protocol

Trial Name: TEST-001 Phase 2 Study of Drug X
Sponsor: Test Pharma Inc.
Phase: Phase 2

Drug Information:
Drug Name: Drug X
Drug Class: SSRI
Mechanism: Selective serotonin reuptake inhibitor

Patient Population:
Age Range: 18-65
Disease: Major Depressive Disorder
Therapeutic Area: Psychiatry

Study Design:
Design Type: Parallel
Blinding: Double-blind
Randomization: Yes
Placebo Controlled: No

Statistical Plan:
Planned Enrollment: 100 patients
Primary Endpoint: Change in HAM-D score at week 8

Safety Monitoring: Standard adverse event monitoring
```

**Test in UI:**
1. Go to http://localhost:3000
2. Click "Get Started" or "Upload Protocol"
3. Upload your test PDF
4. Wait for parsing (~15-30 seconds)
5. Review extracted data
6. Click "Analyze Protocol"
7. Watch progress updates
8. Review results dashboard

**Expected results:**
- Risk score displayed (likely 60-80 for this simple protocol)
- Multiple findings identified
- Similar historical trials shown
- Recommendations provided

### Test 2: Manual Form Entry

1. Click "Enter Manually"
2. Fill out form step-by-step:

**Step 1: Basic Information**
```
Trial Name: Adolescent Depression Study
Sponsor: University Medical Center
Phase: Phase 3
Drug Name: Sertraline
Drug Class: SSRI
```

**Step 2: Study Design**
```
Design Type: Parallel
Blinding: Double-blind
Randomization: Yes
Placebo Controlled: Yes
Placebo Run-in: No (THIS WILL TRIGGER A RISK)
Duration: 12 weeks
```

**Step 3: Patient Population**
```
Age Range: 13-17
Disease: Major Depressive Disorder
Therapeutic Area: Psychiatry
Inclusion: Diagnosed MDD, HAM-D ≥15
Exclusion: Suicidal ideation, bipolar disorder
```

**Step 4: Statistical Plan**
```
Planned Enrollment: 150
Primary Endpoint: Change in CDRS-R at week 12
Power Calculation: No (THIS WILL TRIGGER A RISK)
Expected Effect Size: 0.4
```

**Step 5: Safety**
```
Safety Monitoring: Weekly phone calls, adverse event tracking
```

3. Click "Analyze Protocol"

**Expected risks to be identified:**
- High placebo response risk (adolescent depression)
- No placebo run-in period
- Missing power calculation
- Similar failed trials will be shown

### Test 3: Chat Interface

After analysis completes:

1. Click chat icon (bottom right)
2. Try these questions:
   - "What's the biggest risk in this protocol?"
   - "Why do adolescent depression trials fail?"
   - "How much would a placebo run-in cost?"
   - "What happened in the similar trials you found?"

**Expected behavior:**
- Responses stream in real-time
- Citations to specific historical trials
- Quantified impacts mentioned
- Actionable suggestions provided

### Test 4: Historical Database Search

**Test the database service directly:**
```bash
# In Python (backend virtual environment active)
cd backend
python

>>> from app.services.historical_db import get_historical_db_service
>>> import asyncio
>>>
>>> db = get_historical_db_service()
>>> asyncio.run(db.load_database())
Loaded 20 historical trials
>>>
>>> # Search for similar trials
>>> results = asyncio.run(db.find_similar_trials(
...     drug_class="SSRI",
...     therapeutic_area="psychiatry",
...     phase="Phase 3"
... ))
>>>
>>> for trial in results:
...     print(f"{trial['nct_id']}: {trial['trial_name']} (similarity: {trial['similarity_score']:.2f})")
```

**Expected output:**
```
NCT02134613: STAR*D Follow-up Study (similarity: 0.95)
NCT01988441: ACHIEVE Study - Cariprazine (similarity: 0.82)
...
```

## 🎬 Demo Script (5 minutes)

### Minute 1: Introduction
"TrialGuard uses Gemini 3.0 AI to identify clinical trial design flaws before trials begin, analyzing protocols against 20 curated historical trials to predict failure risk."

### Minute 2: Show the Problem
"Clinical trials fail 90% of the time in Phase 2/3, often due to preventable design flaws. Each failure costs $50-100 million."

### Minute 3: Live Demo - Upload
1. Upload pre-prepared protocol PDF
2. Show real-time extraction with progress bar
3. "Notice how it extracts structured data from the PDF automatically"

### Minute 4: Live Demo - Analysis
1. Click Analyze
2. Show real-time progress updates
3. Reveal risk score with animation
4. Point out specific findings with evidence
5. "See how it compares to NCT02134613, a failed depression trial"

### Minute 5: Show Intelligence
1. Open chat interface
2. Ask: "Why did the similar trials fail?"
3. Show intelligent response with citations
4. Highlight actionable recommendations
5. "Each recommendation is prioritized by impact and cost"

**Closing:**
"TrialGuard demonstrates superior technical execution through intelligent API orchestration, real-time data processing, and beautiful UX—all powered by Gemini 3.0."

## 🐛 Troubleshooting

### Backend Issues

**Error: "Invalid GEMINI_API_KEY"**
```bash
# Verify API key is set correctly
cd backend
python -c "from dotenv import load_dotenv; import os; load_dotenv('../.env'); print(os.getenv('GEMINI_API_KEY')[:20])"

# Should print first 20 chars of your API key
```

**Error: "Historical trials database not found"**
```bash
# Verify database file exists
ls backend/app/data/historical_trials.json

# Should show the file (97KB)
```

**Error: "ModuleNotFoundError"**
```bash
# Reinstall dependencies
pip install -r requirements.txt

# Or install specific missing module
pip install google-generativeai
```

**Error: "Address already in use"**
```bash
# Port 8000 is in use, kill the process or use different port
# On Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -ti:8000 | xargs kill -9
```

### Frontend Issues

**Error: "Cannot connect to backend"**
```bash
# Check backend is running
curl http://localhost:8000/health

# Check VITE_API_URL in frontend/.env
cat frontend/.env

# Should show: VITE_API_URL=http://localhost:8000
```

**Blank page / white screen**
```bash
# Check browser console (F12)
# Common issue: CORS error

# Verify backend CORS settings in backend/app/config.py
# Should include: http://localhost:3000
```

**Styling not loading**
```bash
# Rebuild Tailwind
cd frontend
npm run build:css

# Or restart dev server
npm run dev
```

### Docker Issues

**Error: "Cannot connect to Docker daemon"**
```bash
# Start Docker Desktop (Windows/Mac)
# Or start Docker service (Linux):
sudo systemctl start docker
```

**Error: "Port is already allocated"**
```bash
# Stop conflicting services or change ports in docker-compose.yml
docker-compose down
docker ps  # Check for other containers
```

## 📊 Performance Benchmarks

**Expected timings (with good internet):**
- PDF parsing: 15-30 seconds
- Risk analysis: 30-60 seconds
- Chat response: 2-4 seconds
- Database search: <50ms

**Cost per analysis:**
- Protocol parsing: $0.03
- Risk analysis: $0.05-0.10
- Total per protocol: ~$0.10

## 🎓 Advanced Testing

### Load Testing

```bash
# Test concurrent analyses
cd backend
pip install locust

# Create locustfile.py (simple load test)
# Run: locust -f locustfile.py
```

### API Testing

```bash
# Test all endpoints
curl -X POST http://localhost:8000/api/protocol/validate \
  -H "Content-Type: application/json" \
  -d @test_protocol.json

# Test analysis endpoint
curl -X POST http://localhost:8000/api/analysis/analyze \
  -H "Content-Type: application/json" \
  -d @test_request.json
```

### Browser Testing

Test on multiple browsers:
- Chrome (primary)
- Firefox
- Safari
- Edge

Test on mobile:
- Open Chrome DevTools
- Toggle device toolbar (Ctrl+Shift+M)
- Test various screen sizes

## 🎉 Success Criteria

✅ Backend starts without errors
✅ Frontend loads at http://localhost:3000
✅ Can upload PDF and see parsed data
✅ Analysis completes in <60 seconds
✅ Risk score displays with animation
✅ Historical trials shown
✅ Chat responds intelligently
✅ All components responsive on mobile

## 📞 Quick Reference

**Backend:**
- URL: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

**Frontend:**
- URL: http://localhost:3000
- Build: `npm run build`
- Preview: `npm run preview`

**Docker:**
- Build: `docker-compose build`
- Start: `docker-compose up -d`
- Logs: `docker-compose logs -f`
- Stop: `docker-compose down`

---

**Ready to demo! 🚀**
