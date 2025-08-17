import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import AppHeaderSafe from './components/AppHeaderSafe';
import AppFooter from './components/AppFooter';
import SafeCheckerSafe from './pages/SafeCheckerSafe';
import SeiList from './pages/SeiList';
import SeifunLaunch from './pages/SeifunLaunch';
import Seilor from './pages/Seilor';
import TradingView from './pages/TradingView';
import TradingSearch from './pages/TradingSearch';
import Docs from './pages/Docs';
import DevPlus from './pages/DevPlus';
import RealTimeChart from './components/RealTimeChart';
import WalletConnectionTest from './components/WalletConnectionTest';
import ErrorBoundary from './components/ErrorBoundary';
import AIDashboard from './components/AIDashboard';

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
          <div className="min-h-screen app-bg-primary">
            <AppHeaderSafe />
            <SafeCheckerSafe />
            <AppFooter />
          </div>
        } />
        
        <Route path="/app/safechecker" element={
          <div className="min-h-screen app-bg-primary">
            <AppHeaderSafe />
            <SafeCheckerSafe />
            <AppFooter />
          </div>
        } />
        
        <Route path="/app/seilist" element={
          <div className="min-h-screen app-bg-primary">
            <AppHeaderSafe />
            <SeiList />
            <AppFooter />
          </div>
        } />
        
        <Route path="/app/seifun-launch" element={
          <div className="min-h-screen app-bg-primary">
            <AppHeaderSafe />
            <SeifunLaunch />
            <AppFooter />
          </div>
        } />
        
        <Route path="/app/seilor" element={
          <div className="min-h-screen app-bg-primary">
            <AppHeaderSafe />
            <ErrorBoundary>
              <Seilor />
            </ErrorBoundary>
            <AppFooter />
          </div>
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
        
        <Route path="/app/charts" element={
          <div className="min-h-screen app-bg-primary">
            <AppHeaderSafe />
            <RealTimeChart />
            <AppFooter />
          </div>
        } />
        
        <Route path="/app/wallet-test" element={
          <div className="min-h-screen app-bg-primary">
            <AppHeaderSafe />
            <WalletConnectionTest />
            <AppFooter />
          </div>
        } />

        <Route path="/app/ai-dashboard" element={
          <div className="min-h-screen app-bg-primary">
            <AppHeaderSafe />
            <AIDashboard />
            <AppFooter />
          </div>
        } />
        
        {/* Landing page routes for direct navigation */}
        <Route path="/seilor" element={
          <div className="min-h-screen app-bg-primary">
            <AppHeaderSafe />
            <ErrorBoundary>
              <Seilor />
            </ErrorBoundary>
            <AppFooter />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;