import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppHeaderSafe from './components/AppHeaderSafe';
import AppFooter from './components/AppFooter';
import SeifunLaunch from './pages/SeifunLaunch';
import SeiList from './pages/SeiList';
import SafeChecker from './pages/SafeChecker';
import Seilor from './pages/Seilor';
import DevPlus from './pages/DevPlus';
import Landing from './pages/Landing';
import Docs from './pages/Docs';
import RealTimeChart from './components/RealTimeChart';
import ComingSoon from './components/ComingSoon';
import { getFeatureFlags } from './config/featureFlags';

function App() {
  const features = getFeatureFlags();
  
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Show Landing at both / and /app for clarity */}
          <Route path="/app" element={<Landing />} />
          <Route path="/" element={<Landing />} />
          
          {/* Launch Features - Coming Soon in Production */}
          <Route path="/app/launch" element={
            features.seifunLaunch ? (
              <div className="min-h-screen app-bg-primary">
                <AppHeaderSafe />
                <SeifunLaunch />
                <AppFooter />
              </div>
            ) : (
              <div className="min-h-screen app-bg-primary">
                <AppHeaderSafe />
                <ComingSoon 
                  feature="Seifun Launch" 
                  description="Token launch platform with AI-powered analysis and automated deployment"
                  estimatedLaunch="Q2 2024"
                />
                <AppFooter />
              </div>
            )
          } />
          <Route path="/app/seilist" element={
            features.seilist ? (
              <div className="min-h-screen app-bg-primary">
                <AppHeaderSafe />
                <SeiList />
                <AppFooter />
              </div>
            ) : (
              <div className="min-h-screen app-bg-primary">
                <AppHeaderSafe />
                <ComingSoon 
                  feature="SeiList" 
                  description="Comprehensive token directory with advanced filtering and discovery"
                  estimatedLaunch="Q2 2024"
                />
                <AppFooter />
              </div>
            )
          } />
          
          {/* Core Features - Always Available */}
          <Route path="/app/safechecker" element={
            <div className="min-h-screen app-bg-primary">
              <AppHeaderSafe />
              <SafeChecker />
              <AppFooter />
            </div>
          } />
          
          <Route path="/app/seilor" element={
            <div className="min-h-screen app-bg-primary">
              <AppHeaderSafe />
              <Seilor />
            </div>
          } />
          
          <Route path="/app/docs" element={
            <div className="min-h-screen app-bg-primary">
              <AppHeaderSafe />
              <Docs />
              <AppFooter />
            </div>
          } />
          
          {/* Development Features - Hidden in Production */}
          {features.devPlus && (
            <Route path="/app/devplus" element={
              <div className="min-h-screen app-bg-primary">
                <AppHeaderSafe />
                <DevPlus />
                <AppFooter />
              </div>
            } />
          )}
          
          {features.charts && (
            <Route path="/app/charts" element={
              <div className="min-h-screen app-bg-primary">
                <AppHeaderSafe />
                <RealTimeChart />
                <AppFooter />
              </div>
            } />
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;