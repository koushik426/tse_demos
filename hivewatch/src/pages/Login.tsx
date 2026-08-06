import { useState, FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import HiveWatchLogo from '../components/HiveWatchLogo';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Enter your username and password.');
      return;
    }
    try {
      login(username.trim(), password);
    } catch {
      setError('Sign in failed. Check your credentials.');
    }
  };

  return (
    <div className="hw-login">
      <div className="hw-login-card">
        <HiveWatchLogo />
        <h1 className="hw-login-title">Security Operations</h1>
        <p className="hw-login-sub">Sign in with your ThoughtSpot credentials</p>
        <form className="hw-login-form" onSubmit={submit}>
          {error && <div className="hw-login-error">{error}</div>}
          <label className="hw-login-label">Username</label>
          <input
            className="hw-login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            placeholder="Enter your username"
          />
          <label className="hw-login-label">Password</label>
          <div className="hw-login-pw">
            <input
              className="hw-login-input"
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="hw-login-eye"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? 'Hide' : 'Show'}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button className="hw-login-btn" type="submit">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
