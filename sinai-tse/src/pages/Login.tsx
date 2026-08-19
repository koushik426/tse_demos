import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import SINAILogo from '../components/SINAILogo';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await login(username.trim(), password);
    } catch {
      setError('Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <SINAILogo className="login-logo" size={34} />
        <div className="login-hero-content">
          <h1 className="login-hero-title">
            Decarbonization,<br />measured &amp; managed.
          </h1>
          <p className="login-hero-subtitle">
            Emissions, activity data, and AI-powered answers across every scope —
            all in one place, powered by ThoughtSpot.
          </p>
          <div className="login-stats">
            <div className="login-stat">
              <span className="login-stat-value">3</span>
              <span className="login-stat-label">Scopes Covered</span>
            </div>
            <div className="login-stat">
              <span className="login-stat-value">100%</span>
              <span className="login-stat-label">Auditable Data</span>
            </div>
            <div className="login-stat">
              <span className="login-stat-value">60%</span>
              <span className="login-stat-label">Faster Insights</span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-card-title">Sign in</h2>
            <p className="login-card-subtitle">
              Enter any username and password to continue
            </p>
          </div>

          <div className="login-demo-note">
            <strong>Demo access:</strong> credentials here are just a gate — type
            anything. For the embedded analytics to load, make sure you're signed
            in to your ThoughtSpot trial (<code>team1.thoughtspot.cloud</code>) in
            another browser tab.
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="login-error">{error}</div>}

            <div className="login-field">
              <label htmlFor="username" className="login-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="login-input"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="login-field">
              <label htmlFor="password" className="login-label">
                Password
              </label>
              <div className="login-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="login-input login-input-password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={isLoading || !username.trim() || !password.trim()}
            >
              {isLoading ? <span className="login-spinner" /> : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <span>Powered by</span>
            <span className="login-ts-badge">ThoughtSpot</span>
          </div>
        </div>
      </div>
    </div>
  );
}
