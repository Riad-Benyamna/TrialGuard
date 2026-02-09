# TrialGuard Frontend - Quick Start Guide

## Installation & Setup

### 1. Install Dependencies

```bash
cd c:\Users\speed\Documents\gemini\trialguard\frontend
npm install
```

This will install all required packages:
- React & React DOM
- React Router for navigation
- Tailwind CSS for styling
- Framer Motion for animations
- Recharts for data visualization
- Axios for API calls
- Lucide React for icons

### 2. Configure Environment

Create a `.env` file in the frontend directory:

```bash
cp .env.example .env
```

Edit `.env` and set your backend API URL:
```
VITE_API_URL=http://localhost:8000
```

### 3. Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## First Run Checklist

- [ ] Node.js 16+ is installed
- [ ] Dependencies installed with `npm install`
- [ ] `.env` file created with API URL
- [ ] Backend server is running at the configured URL
- [ ] Open browser to `http://localhost:3000`

## Testing the Application

### Without Backend (Frontend Only)

The frontend will work but API calls will fail. You can still:
- Navigate through pages
- See UI components and animations
- Test form validation
- View the landing page

### With Backend (Full Functionality)

1. Ensure the FastAPI backend is running at `http://localhost:8000`
2. Test the complete flow:
   - Upload a PDF or fill out the form
   - View real-time analysis progress
   - Explore analysis results
   - Chat with the AI assistant
   - Browse historical trials

## Project Structure Overview

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/          # Button, Card, Toast, LoadingState
│   │   ├── protocol/        # ProtocolForm, PDFUploader, FieldGroup
│   │   ├── analysis/        # RiskScoreHero, RiskBreakdownCards, etc.
│   │   └── chat/            # ChatInterface, MessageBubble
│   ├── hooks/               # useAnalysis, useProtocolForm, useChat
│   ├── pages/               # Home, ProtocolInput, AnalysisResults, HistoricalDatabase
│   ├── utils/               # api.js, formatting.js, constants.js
│   ├── App.jsx              # Main app with routes
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind theme
└── postcss.config.js        # PostCSS config

```

## Key Features Implemented

### 1. Protocol Input (Two Methods)
- **Structured Form**: Multi-step form with validation
  - Basic Information (name, phase, therapeutic area)
  - Study Design (randomization, blinding, duration)
  - Population (enrollment, eligibility criteria)
  - Statistical Design (endpoints, sample size)
  - Safety & Monitoring

- **PDF Upload**: Drag-and-drop PDF uploader
  - File validation (type, size)
  - Progress tracking
  - Error handling

### 2. Analysis Dashboard
- **Risk Score Hero**: Large animated circular progress
- **Risk Breakdown**: Category cards with scores
- **Findings Timeline**: Vertical timeline of risks
- **Recommendations Panel**: Prioritized action items
- **Historical Comparison**: Table and chart comparisons
- **Summary Statistics**: Key metrics overview

### 3. Chat Assistant
- Floating chat interface
- Context-aware AI responses
- Typewriter effect for messages
- Message history
- Minimizable window

### 4. UI/UX Features
- Responsive design (mobile-first)
- Smooth animations with Framer Motion
- Loading states and skeletons
- Toast notifications
- Error handling
- Accessibility features

## Customization

### Colors

Edit `tailwind.config.js` to change theme colors:

```javascript
colors: {
  primary: { ... },    // Indigo
  success: { ... },    // Emerald (low risk)
  warning: { ... },    // Amber (moderate risk)
  danger: { ... },     // Rose (high risk)
}
```

### API Endpoints

Edit `src/utils/constants.js` to change API endpoints:

```javascript
export const API_ENDPOINTS = {
  ANALYZE_PROTOCOL: '/api/analyze',
  ANALYZE_PDF: '/api/analyze-pdf',
  // ... more endpoints
};
```

### Form Fields

Edit `src/hooks/useProtocolForm.js` to add/modify form fields and validation rules.

## Troubleshooting

### Port 3000 Already in Use

Change the port in `vite.config.js`:

```javascript
server: {
  port: 3001, // or any other port
}
```

### API Connection Issues

1. Check `.env` file has correct `VITE_API_URL`
2. Verify backend is running
3. Check browser console for CORS errors
4. Ensure backend allows requests from frontend origin

### Build Errors

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   ```

## Production Deployment

### Build

```bash
npm run build
```

This creates optimized files in the `dist/` directory.

### Environment Variables

Set production API URL:
```
VITE_API_URL=https://your-production-api.com
```

### Deploy

The `dist/` folder can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

### Nginx Configuration Example

```nginx
server {
  listen 80;
  server_name your-domain.com;
  root /path/to/dist;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

## Support

For issues or questions:
1. Check the main README.md
2. Review component documentation in code
3. Check browser console for errors
4. Verify API responses in Network tab

## Next Steps

After setup:
1. Explore the landing page
2. Try the protocol input form
3. Upload a sample PDF
4. View analysis results
5. Test the chat assistant
6. Browse the historical database

Enjoy using TrialGuard!
