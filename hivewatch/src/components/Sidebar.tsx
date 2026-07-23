import {
  Globe,
  Building2,
  AlertTriangle,
  Cctv,
  LayoutDashboard,
  FolderKanban,
  Sparkles,
  ListChecks,
  Route,
  Network,
} from 'lucide-react';
import HiveWatchLogo from './HiveWatchLogo';

export type NavId =
  | 'global'
  | 'facilities'
  | 'incidents'
  | 'devices'
  | 'dashboard'
  | 'reports'
  | 'ask'
  | 'sops'
  | 'guardtours'
  | 'gateways';

interface NavItem {
  id: NavId;
  label: string;
  icon: typeof Globe;
  live?: boolean; // functional (vs. demo placeholder)
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'global', label: 'Global', icon: Globe },
  { id: 'facilities', label: 'Facilities', icon: Building2 },
  { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
  { id: 'devices', label: 'Devices', icon: Cctv },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, live: true },
  { id: 'reports', label: 'My Reports', icon: FolderKanban, live: true },
  { id: 'ask', label: 'Ask HiveWatch AI', icon: Sparkles, live: true },
  { id: 'sops', label: 'SOPs', icon: ListChecks },
  { id: 'guardtours', label: 'Guard Tours', icon: Route },
  { id: 'gateways', label: 'Gateways', icon: Network },
];

interface Props {
  active: NavId;
  onChange: (id: NavId) => void;
}

export default function Sidebar({ active, onChange }: Props) {
  return (
    <aside className="hw-sidebar">
      <div className="hw-sidebar-logo">
        <HiveWatchLogo />
      </div>
      <nav className="hw-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`hw-nav-item${active === item.id ? ' is-active' : ''}`}
              onClick={() => onChange(item.id)}
            >
              <Icon size={20} strokeWidth={2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
