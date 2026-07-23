// Dashboard tab — a full-width embedded Liveboard with the on-board Spotter
// panel. Docs: https://developers.thoughtspot.com/docs/embed-a-liveboard
import { LiveboardEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { DASHBOARD_LIVEBOARD_ID, LIVEBOARD_EMBED_FLAGS, SPOTTER_VIZ_CONFIG } from '../config';
import { tsCustomizations } from '../lib/thoughtspot';
import { useTheme } from '../context/ThemeContext';

const Liveboard = LiveboardEmbed as any;

export default function Dashboard() {
  const { theme } = useTheme();
  return (
    // `key` on theme so the embed re-mounts cleanly when the palette flips.
    <div className="hw-liveboard-wrapper">
      <Liveboard
        key={theme}
        liveboardId={DASHBOARD_LIVEBOARD_ID}
        {...LIVEBOARD_EMBED_FLAGS}
        spotterViz={SPOTTER_VIZ_CONFIG}
        frameParams={{ width: '100%' }}
        customizations={tsCustomizations(theme)}
      />
    </div>
  );
}
