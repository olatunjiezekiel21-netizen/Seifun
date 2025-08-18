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

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/app" element={<Landing />} />
          <Route path="/" element={
            <div className="min-h-screen app-bg-primary">
              <AppHeaderSafe />
              <SeifunLaunch />
              <AppFooter />
            </div>
          } />
          <Route path="/app/launch" element={
            <div className="min-h-screen app-bg-primary">
              <AppHeaderSafe />
              <SeifunLaunch />
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
              <AppFooter />
            </div>
          } />
          <Route path="/app/devplus" element={
            <div className="min-h-screen app-bg-primary">
              <AppHeaderSafe />
              <DevPlus />
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