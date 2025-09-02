import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppHeaderSafe from './components/AppHeaderSafe';
import AppFooter from './components/AppFooter';
import SeifunLaunch from './pages/SeifunLaunch';
import LaunchPage from './pages/LaunchPage';
import SeiList from './pages/SeiList';
import SafeChecker from './pages/SafeChecker';
import Seilor from './pages/Seilor';
import DevPlus from './pages/DevPlus';
import Landing from './pages/Landing';
import Docs from './pages/Docs';
import RealTimeChart from './components/RealTimeChart';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Show Landing at both / and /app for clarity */}
          <Route path="/app" element={<Landing />} />
          <Route path="/" element={<Landing />} />
          <Route path="/app/launch" element={
            <div className="min-h-screen app-bg-primary">
              <AppHeaderSafe />
              <SeifunLaunch />
              <AppFooter />
            </div>
          } />
          <Route path="/app/trading" element={
            <div className="min-h-screen app-bg-primary">
              <AppHeaderSafe />
              <LaunchPage />
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
          <Route path="/app/devplus" element={
            <div className="min-h-screen app-bg-primary">
              <AppHeaderSafe />
              <DevPlus />
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
          <Route path="/app/charts" element={
            <div className="min-h-screen app-bg-primary">
              <AppHeaderSafe />
              <RealTimeChart />
              <AppFooter />
            </div>
          } />
          {/* Charts route removed as charts are embedded within token views */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;