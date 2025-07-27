/*
================================================================================
File: app/LandingPage.tsx (New Redesigned Version)
================================================================================
This component is a translation of the provided HTML/CSS/JS into a 
self-contained React component for your Next.js app.
*/
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  // State to manage the user's demo picks
  const [selectedPicks, setSelectedPicks] = useState<{ [key: string]: string }>({});
  // State to control the visibility of the "soft wall" CTA
  const [showSoftWall, setShowSoftWall] = useState(false);

  const pickCount = Object.keys(selectedPicks).length;
  const maxPicks = 3;

  // Effect to show the soft wall once the user has made enough picks
  useEffect(() => {
    if (pickCount >= maxPicks && !showSoftWall) {
      setShowSoftWall(true);
      setTimeout(() => {
        const softWallEl = document.getElementById('softWall');
        if (softWallEl) {
          softWallEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [pickCount, showSoftWall]);

  // Handler for when a user clicks a pick button
  const handlePick = (matchId: string, pick: string) => {
    setSelectedPicks(prev => {
      const newPicks = { ...prev };
      // If the user clicks the same pick again, deselect it
      if (newPicks[matchId] === pick) {
        delete newPicks[matchId];
      } else {
        // Otherwise, select the new pick
        newPicks[matchId] = pick;
      }
      return newPicks;
    });
  };

  return (
    <>
      {/* This style block contains all the CSS from your HTML file */}
      <style jsx global>{`
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #ffffff;
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
          overflow-x: hidden;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .bg-elements {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          overflow: hidden;
        }
        .floating-shape {
          position: absolute;
          background: linear-gradient(45deg, rgba(255, 107, 107, 0.1), rgba(78, 205, 196, 0.1));
          border-radius: 50%;
          animation: float 20s infinite linear;
        }
        .floating-shape:nth-child(1) { width: 80px; height: 80px; top: 20%; left: 10%; animation-delay: 0s; }
        .floating-shape:nth-child(2) { width: 120px; height: 120px; top: 60%; right: 10%; animation-delay: -7s; }
        .floating-shape:nth-child(3) { width: 60px; height: 60px; top: 80%; left: 30%; animation-delay: -14s; }
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(20px) rotate(240deg); }
          100% { transform: translateY(0px) rotate(360deg); }
        }
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          position: relative;
          text-align: center;
          background: radial-gradient(circle at 50% 50%, rgba(255, 107, 107, 0.1) 0%, transparent 70%);
        }
        .hero-content h1 {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 4s ease-in-out infinite;
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .hero-content p {
          font-size: 1.4rem;
          margin-bottom: 2.5rem;
          color: #b8b8d1;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        .cta-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 3rem;
        }
        .btn-primary, .btn-secondary {
          padding: 16px 40px;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s ease;
        }
        .btn-primary {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
          border: none;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(255, 107, 107, 0.4);
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }
        .btn-primary:hover::before { left: 100%; }
        .btn-secondary {
          background: transparent;
          color: #4ecdc4;
          border: 2px solid #4ecdc4;
        }
        .btn-secondary:hover {
          background: #4ecdc4;
          color: #0f0f23;
          transform: translateY(-2px);
        }
        .section { padding: 80px 0; position: relative; }
        .section:nth-of-type(even) { background: rgba(255, 255, 255, 0.02); }
        .section h2 {
          font-size: 2.5rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 3rem;
          color: #ffffff;
        }
        .steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 40px;
          margin-top: 60px;
        }
        .step {
          text-align: center;
          padding: 40px 30px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .step::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }
        .step:hover::before { transform: scaleX(1); }
        .step:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        .step-number {
          display: inline-block;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
          color: white;
          border-radius: 50%;
          font-size: 1.5rem;
          font-weight: bold;
          line-height: 60px;
          margin-bottom: 20px;
        }
        .step h3 { font-size: 1.4rem; margin-bottom: 15px; color: #ffffff; }
        .step p { color: #b8b8d1; font-size: 1.1rem; }
        .subtext { text-align: center; margin-top: 40px; color: #4ecdc4; font-size: 0.95rem; }
        .leaderboard-preview p { font-size: 1.3rem; color: #b8b8d1; max-width: 600px; margin: 0 auto 40px; }
        .soft-wall {
          background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(78, 205, 196, 0.1));
          border-radius: 30px;
          padding: 60px 40px;
          text-align: center;
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          margin: 40px 0;
          display: none;
        }
        .soft-wall.show { display: block; animation: slideUp 0.6s ease-out; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .soft-wall h2 { margin-bottom: 1rem; }
        .soft-wall p { font-size: 1.2rem; color: #b8b8d1; margin-bottom: 30px; }
        .microcopy { font-size: 0.9rem; color: #888; margin-top: 15px; }
        .europe-section p { font-size: 1.3rem; color: #b8b8d1; max-width: 700px; margin: 0 auto 30px; }
        .flags { font-size: 2rem; margin-top: 20px; }
        .final-cta { text-align: center; background: radial-gradient(circle at center, rgba(255, 107, 107, 0.1) 0%, transparent 70%); }
        .final-cta h2 { margin-bottom: 1rem; }
        .final-cta p { font-size: 1.3rem; color: #b8b8d1; margin-bottom: 40px; max-width: 500px; margin-left: auto; margin-right: auto; }
        .pick-counter {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.8);
          padding: 10px 20px;
          border-radius: 20px;
          font-weight: bold;
          z-index: 1000;
          opacity: 0;
          transform: translateY(-20px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .pick-counter.show { opacity: 1; transform: translateY(0); }
        .demo-picks {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin: 40px 0;
        }
        .match-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          padding: 20px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        .match-card:hover { background: rgba(255, 255, 255, 0.1); transform: translateY(-2px); }
        .teams { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .team { font-weight: 600; font-size: 1.1rem; }
        .vs { color: #888; font-size: 0.9rem; }
        .pick-options { display: flex; gap: 10px; justify-content: center; }
        .pick-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          flex-grow: 1;
        }
        .pick-btn:hover { background: rgba(255, 255, 255, 0.2); }
        .pick-btn.selected { background: #4ecdc4; border-color: #4ecdc4; color: #0f0f23; }
        @media (max-width: 768px) {
          .cta-buttons { flex-direction: column; align-items: center; }
          .btn-primary, .btn-secondary { width: 100%; max-width: 300px; }
          .steps { grid-template-columns: 1fr; }
          .soft-wall { padding: 40px 20px; }
        }
      `}</style>

      <div>
        <div className="bg-elements">
          <div className="floating-shape"></div>
          <div className="floating-shape"></div>
          <div className="floating-shape"></div>
        </div>
        
        <div className={`pick-counter ${pickCount > 0 ? 'show' : ''}`}>
          Picks made: <span>{pickCount}</span>/{maxPicks}
        </div>

        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <h1>Make Your Picks. Beat the Crowd.</h1>
              <p>Predict the outcomes of every game. Climb the leaderboard.<br />100% free. No downloads. Just pure competition.</p>
              <div className="cta-buttons">
                <a href="#demo-picks" className="btn-primary">Start Picking</a>
                <a href="#how-it-works" className="btn-secondary">How It Works</a>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="demo-picks">
          <div className="container">
            <h2>🏀 Make Your First Picks</h2>
            <div className="demo-picks">
              {[
                { id: '1', team_a: 'Spain', team_b: 'France' },
                { id: '2', team_a: 'Germany', team_b: 'Italy' },
                { id: '3', team_a: 'Greece', team_b: 'Serbia' },
                { id: '4', team_a: 'Slovenia', team_b: 'Lithuania' },
              ].map(match => (
                <div key={match.id} className={`match-card ${selectedPicks[match.id] ? 'selected' : ''}`}>
                  <div className="teams">
                    <span className="team">{match.team_a}</span>
                    <span className="vs">vs</span>
                    <span className="team">{match.team_b}</span>
                  </div>
                  <div className="pick-options">
                    <button 
                      className={`pick-btn ${selectedPicks[match.id] === match.team_a ? 'selected' : ''}`}
                      onClick={() => handlePick(match.id, match.team_a)}
                    >
                      {match.team_a}
                    </button>
                    <button 
                      className={`pick-btn ${selectedPicks[match.id] === match.team_b ? 'selected' : ''}`}
                      onClick={() => handlePick(match.id, match.team_b)}
                    >
                      {match.team_b}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="how-it-works">
          <div className="container">
            <h2>How It Works</h2>
            <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#b8b8d1', marginBottom: '40px' }}>No Brackets. No Bull.</p>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <h3>Make your predictions</h3>
                <p>Pick the winners for each match — it only takes a few clicks.</p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h3>Score 1 point</h3>
                <p>Every correct prediction gets you 1 point. Simple.</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h3>Climb the leaderboard</h3>
                <p>See how you stack up against fans across Europe.</p>
              </div>
            </div>
            <div className="subtext">
              Private leagues coming soon 👀
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className={`soft-wall ${showSoftWall ? 'show' : ''}`} id="softWall">
              <h2>🔥 You&apos;re on a roll.</h2>
              <p>Create your free account to lock in your picks and see where you rank.</p>
              <Link href="/login" className="btn-primary">Create My Free Account</Link>
              <div className="microcopy">Takes 10 seconds. No spam, ever.</div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container" style={{ textAlign: 'center' }}>
            <h2>🏆 You vs. Everyone Else</h2>
            <p className="leaderboard-preview">Top the public leaderboard and claim the bragging rights. It&apos;s not just about watching — it&apos;s about predicting better than the rest.</p>
            <Link href="/login" className="btn-primary">Create Account to Join the Leaderboard</Link>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="europe-section" style={{ textAlign: 'center' }}>
              <h2>🌍 Built for European Sports Fans</h2>
              <p>We&apos;re starting with a summer of basketball, but we&apos;re not stopping there. Football, hockey, and more are on the way — all with a simple, fun prediction format.</p>
              <div className="subtext">
                Local languages coming soon: <span className="flags">🇪🇸 🇫🇷 🇮🇹 🇩🇪</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section final-cta">
          <div className="container">
            <h2>🏀 Ready to make your first picks?</h2>
            <p>Join the game. Compete with fans across Europe. No strings. Just sports.</p>
            <a href="#demo-picks" className="btn-primary">Start Picking Now</a>
          </div>
        </section>
      </div>
    </>
  );
}
