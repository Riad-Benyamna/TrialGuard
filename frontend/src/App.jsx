/**
 * Main App component with router setup
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast';
import Home from './pages/Home';
import ProtocolInput from './pages/ProtocolInput';
import AnalysisResults from './pages/AnalysisResults';
import HistoricalDatabase from './pages/HistoricalDatabase';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/protocol-input" element={<ProtocolInput />} />
          <Route path="/results" element={<AnalysisResults />} />
          <Route path="/database" element={<HistoricalDatabase />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
