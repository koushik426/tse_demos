import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Sparkles, TrendingUp, Target, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { username } = useAuth();
  const displayName = username ? username.split('@')[0] : 'there';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="home-page">
      <div className="home-top-bar">
        <h2 className="home-top-bar-title">Good {getGreeting()}, {displayName} 👋</h2>
        <span className="home-top-bar-date">{today}</span>
      </div>

      <section className="home-hero">
        <div className="home-hero-eyebrow">Revenue Intelligence Platform</div>
        <h1 className="home-hero-title">
          Your Sales Data,<br />Beautifully Answered.
        </h1>
        <p className="home-hero-subtitle">
          Explore pipeline performance, team activity, and AI-powered insights — all powered by ThoughtSpot.
        </p>
      </section>

      <div className="home-stats-bar">
        <div className="home-stat-item">
          <span className="home-stat-label">Pipeline Coverage</span>
          <span className="home-stat-value">3.2x</span>
          <span className="home-stat-change">↑ +0.4x vs last quarter</span>
        </div>
        <div className="home-stat-item">
          <span className="home-stat-label">Win Rate</span>
          <span className="home-stat-value">38%</span>
          <span className="home-stat-change">↑ +5pp vs last quarter</span>
        </div>
        <div className="home-stat-item">
          <span className="home-stat-label">Avg Deal Velocity</span>
          <span className="home-stat-value">24d</span>
          <span className="home-stat-change">↓ 3 days faster</span>
        </div>
        <div className="home-stat-item">
          <span className="home-stat-label">Active Reps</span>
          <span className="home-stat-value">142</span>
          <span className="home-stat-change">↑ +12 this month</span>
        </div>
      </div>

      <div className="home-main">
        <p className="home-section-heading">Quick Access</p>
        <div className="home-cards">
          <button className="home-card" onClick={() => navigate('/dashboard')}>
            <div className="home-card-icon">
              <LayoutDashboard size={22} color="var(--sl-blue)" />
            </div>
            <div className="home-card-body">
              <h3 className="home-card-title">Sales Dashboard</h3>
              <p className="home-card-desc">
                Monitor pipeline health, rep performance, deal progression, and revenue attainment in real time.
              </p>
            </div>
            <ArrowRight size={16} className="home-card-arrow" />
          </button>

          <button className="home-card" onClick={() => navigate('/spotter')}>
            <div className="home-card-icon">
              <Sparkles size={22} color="var(--sl-blue)" />
            </div>
            <div className="home-card-body">
              <h3 className="home-card-title">AI Sales Assistant</h3>
              <p className="home-card-desc">
                Ask questions in plain English — "Which deals slipped this week?" or "Who are my top performers?" — and get instant answers.
              </p>
            </div>
            <ArrowRight size={16} className="home-card-arrow" />
          </button>
        </div>

        <p className="home-section-heading">Why ThoughtSpot + Salesloft</p>
        <div className="home-features">
          <div className="home-feature">
            <div className="home-feature-icon">
              <Zap size={18} color="var(--sl-blue)" />
            </div>
            <h4 className="home-feature-title">Instant Answers</h4>
            <p className="home-feature-desc">
              No more waiting for reports. Ask your data questions and get visualizations immediately.
            </p>
          </div>
          <div className="home-feature">
            <div className="home-feature-icon">
              <TrendingUp size={18} color="var(--sl-blue)" />
            </div>
            <h4 className="home-feature-title">Live Pipeline Data</h4>
            <p className="home-feature-desc">
              Always-fresh dashboards connected to your Salesloft activity and CRM data.
            </p>
          </div>
          <div className="home-feature">
            <div className="home-feature-icon">
              <Target size={18} color="var(--sl-blue)" />
            </div>
            <h4 className="home-feature-title">Smarter Forecasting</h4>
            <p className="home-feature-desc">
              AI-driven insights help managers coach more effectively and reps close faster.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
