import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import TokenScanner from './components/TokenScanner';
import SeifuMasterAI from './components/SeifuMasterAI';
import LiveTokens from './components/LiveTokens';
import TrustedCreators from './components/TrustedCreators';
import Footer from './components/Footer';
import Launchpad from './pages/Launchpad';
import MemeHub from './pages/MemeHub';
import Docs from './pages/Docs';

function App() {
  React.useEffect(() => {
    // Update document title
    document.title = 'Seifu - Launch Safe Meme Tokens on Sei';
    
    // Add smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#F7F7F9]">
        <Header />
        <Routes>
          <Route path="/" element={
            <main>
              <Hero />
              <HowItWorks />
              <TokenScanner />
              <SeifuMasterAI />
              <LiveTokens />
              <TrustedCreators />
            </main>
          } />
          <Route path="/launchpad" element={<Launchpad />} />
          <Route path="/memehub" element={<MemeHub />} />
          <Route path="/docs" element={<Docs />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;