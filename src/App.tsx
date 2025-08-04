import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import AppHeader from './components/AppHeader';
import AppFooter from './components/AppFooter';
import SafeChecker from './pages/SafeChecker';
import SeiList from './pages/SeiList';
import SeifunLaunch from './pages/SeifunLaunch';
import TokenPulse from './pages/TokenPulse';
import Docs from './pages/Docs';
import DevPlus from './pages/DevPlus';

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
            <AppHeader />
            <SafeChecker />
            <AppFooter />
          </div>
        } />
        
        <Route path="/app/safechecker" element={
          <div className="min-h-screen app-bg-primary">
            <AppHeader />
            <SafeChecker />
            <AppFooter />
          </div>
        } />
        
        <Route path="/app/seilist" element={
          <div className="min-h-screen app-bg-primary">
            <AppHeader />
            <SeiList />
            <AppFooter />
          </div>
        } />
        
        <Route path="/app/seifun-launch" element={
          <div className="min-h-screen app-bg-primary">
            <AppHeader />
            <SeifunLaunch />
            <AppFooter />
          </div>
        } />
        
        <Route path="/app/token-pulse" element={
          <div className="min-h-screen app-bg-primary">
            <AppHeader />
            <TokenPulse />
            <AppFooter />
          </div>
        } />
        
        <Route path="/app/docs" element={
          <div className="min-h-screen app-bg-primary">
            <AppHeader />
            <Docs />
            <AppFooter />
          </div>
        } />
        
        <Route path="/app/dev-plus" element={
          <div className="min-h-screen app-bg-primary">
            <AppHeader />
            <DevPlus />
            <AppFooter />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;