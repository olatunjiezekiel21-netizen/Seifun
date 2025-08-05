import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import AppHeaderSafe from './components/AppHeaderSafe';
import AppFooter from './components/AppFooter';
import AppDashboard from './pages/AppDashboard';
import SafeCheckerSafe from './pages/SafeCheckerSafe';
import SeiList from './pages/SeiList';
import SeifunLaunch from './pages/SeifunLaunch';
import Seilor from './pages/Seilor';
import TradingView from './pages/TradingView';
import TradingSearch from './pages/TradingSearch';
import Docs from './pages/Docs';
import DevPlus from './pages/DevPlus';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  React.useEffect(() => {
    // Update document title
    document.title = 'Seifun - Launch Safe Meme Tokens on Sei';
    
    // Add smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  return (
    <Router>
      <Routes>
        {/* Landing Page Route */}
        <Route path="/" element={<Landing />} />
        
        {/* App Routes - All with darker blue UI and Sei colors */}
        <Route path="/app" element={
          <ErrorBoundary>
            <div className="min-h-screen app-bg-primary">
              <AppHeaderSafe />
              <AppDashboard />
              <AppFooter />
            </div>
          </ErrorBoundary>
        } />
        
        <Route path="/app/safechecker" element={
          <ErrorBoundary>
            <div className="min-h-screen app-bg-primary">
              <AppHeaderSafe />
              <SafeCheckerSafe />
              <AppFooter />
            </div>
          </ErrorBoundary>
        } />
        
        <Route path="/app/seilist" element={
          <ErrorBoundary>
            <div className="min-h-screen app-bg-primary">
              <AppHeaderSafe />
              <SeiList />
              <AppFooter />
            </div>
          </ErrorBoundary>
        } />
        
        <Route path="/app/seifun-launch" element={
          <ErrorBoundary>
            <div className="min-h-screen app-bg-primary">
              <AppHeaderSafe />
              <SeifunLaunch />
              <AppFooter />
            </div>
          </ErrorBoundary>
        } />
        
        <Route path="/app/seilor" element={
          <ErrorBoundary>
            <div className="min-h-screen app-bg-primary">
              <AppHeaderSafe />
              <Seilor />
              <AppFooter />
            </div>
          </ErrorBoundary>
        } />
        
        <Route path="/app/trading/:chainId/:pairAddress" element={
          <div className="min-h-screen app-bg-primary">
            <AppHeaderSafe />
            <TradingView />
            <AppFooter />
          </div>
        } />
        
        <Route path="/app/trading/:chainId/search" element={
          <div className="min-h-screen app-bg-primary">
            <AppHeaderSafe />
            <TradingSearch />
            <AppFooter />
          </div>
        } />
        
        <Route path="/app/docs" element={
          <div className="min-h-screen app-bg-primary">
            <AppHeaderSafe />
            <Docs />
            <AppFooter />
          </div>
        } />
        
        <Route path="/app/dev-plus" element={
          <div className="min-h-screen app-bg-primary">
            <AppHeaderSafe />
            <DevPlus />
            <AppFooter />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;