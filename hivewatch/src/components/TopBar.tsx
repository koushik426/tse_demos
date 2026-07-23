import { Phone, Plus, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Props {
  title: string;
  onCreate: () => void;
  creating: boolean;
}

export default function TopBar({ title, onCreate, creating }: Props) {
  const { theme, toggle } = useTheme();
  return (
    <header className="hw-topbar">
      <h1 className="hw-topbar-title">{title}</h1>

      <div className="hw-topbar-actions">
        <button className="hw-btn hw-btn-danger">
          Emergency <Phone size={16} />
        </button>
        <button className="hw-btn hw-btn-accent" onClick={onCreate} disabled={creating}>
          {creating ? 'Creating…' : 'Create'} <Plus size={16} />
        </button>
        <button
          className="hw-theme-toggle"
          onClick={toggle}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
