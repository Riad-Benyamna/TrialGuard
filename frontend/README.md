# TrialGuard Frontend

AI-Powered Clinical Trial Risk Assessment Platform - React Frontend

## Features

- **Multi-Step Protocol Form**: Guided form with validation and step-by-step input
- **PDF Upload**: Drag-and-drop PDF upload with progress tracking
- **Real-Time Analysis**: Server-sent events for live progress updates
- **Risk Visualization**: Interactive charts and animated risk scores
- **Historical Comparison**: Compare against similar trials
- **AI Chat Assistant**: Context-aware chat for analysis questions
- **Responsive Design**: Mobile-first design that works on all devices
- **Beautiful UI**: Medical-grade aesthetic with smooth animations

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   ```

3. Configure API endpoint in `.env`:
   ```
   VITE_API_URL=http://localhost:8000
   ```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components (Button, Card, Toast, etc.)
│   ├── protocol/        # Protocol form and PDF uploader
│   ├── analysis/        # Analysis visualization components
│   └── chat/            # Chat interface components
├── hooks/               # Custom React hooks
│   ├── useAnalysis.js   # Analysis state management
│   ├── useProtocolForm.js # Form state and validation
│   └── useChat.js       # Chat session management
├── pages/               # Page components
│   ├── Home.jsx         # Landing page
│   ├── ProtocolInput.jsx # Protocol input page
│   ├── AnalysisResults.jsx # Results dashboard
│   └── HistoricalDatabase.jsx # Browse trials
├── utils/               # Utility functions
│   ├── api.js           # API client
│   ├── formatting.js    # Data formatting utilities
│   └── constants.js     # Constants and config
├── App.jsx              # Root component with routes
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## Key Features

### Protocol Input

Two ways to provide protocol data:
1. **Structured Form**: Multi-step form with validation
2. **PDF Upload**: Direct PDF upload with extraction

### Analysis Dashboard

- Overall risk score with animated circular progress
- Risk breakdown by category (Design, Statistical, Regulatory, Operational)
- Timeline of key findings with severity levels
- Prioritized recommendations
- Historical comparison with similar trials
- Interactive charts and visualizations

### Chat Assistant

- Floating chat interface
- Context-aware responses about the analysis
- Typewriter effect for AI messages
- Message history

### Responsive Design

- Mobile-first approach
- Adapts to all screen sizes
- Touch-friendly interactions
- Optimized performance

## Styling

The app uses Tailwind CSS with a custom theme:

- **Primary**: Indigo (clinical trust)
- **Success**: Emerald (low risk)
- **Warning**: Amber (moderate risk)
- **Danger**: Rose (high risk)

Custom utilities:
- `.gradient-primary`, `.gradient-success`, etc.
- `.glass` - Glass morphism effect
- `.custom-scrollbar` - Styled scrollbars
- `.skeleton` - Loading animations

## API Integration

The frontend expects these backend endpoints:

- `POST /api/analyze` - Analyze protocol from form data
- `POST /api/analyze-pdf` - Analyze protocol from PDF
- `GET /api/stream-analysis` - SSE endpoint for streaming
- `POST /api/chat` - Send chat message
- `GET /api/history` - Get historical trials
- `GET /api/trials/:id` - Get trial by ID

## Environment Variables

- `VITE_API_URL` - Backend API base URL (default: http://localhost:8000)

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## Performance

- Code splitting with React Router
- Lazy loading of heavy components
- Optimized bundle size
- Efficient re-renders with React hooks

## Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance
- Screen reader friendly

## License

This project is part of the TrialGuard platform.
