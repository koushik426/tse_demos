import { useState } from 'react';
import { LiveboardEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { Wand2 } from 'lucide-react';
import {
  ANALYTICS_LIVEBOARD_ID,
  LIVEBOARD_EMBED_FLAGS,
} from '../config';
import { tsCustomizations } from '../lib/thoughtspot';
import SpotterModal from '../components/SpotterModal';

const Liveboard = LiveboardEmbed as unknown as (props: any) => JSX.Element;

export default function Analytics() {
  const [spotterOpen, setSpotterOpen] = useState(false);

  return (
    <div className="tab-analytics">
      <div className="analytics-toolbar">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Your live revenue performance dashboard</p>
        </div>
        <button
          className="salesloft-ai-btn"
          onClick={() => setSpotterOpen(true)}
        >
          <Wand2 size={18} strokeWidth={2.2} />
          <span>SALESLOFT AI</span>
        </button>
      </div>

      <div className="liveboard-wrapper">
        <Liveboard
          liveboardId={ANALYTICS_LIVEBOARD_ID}
          fullHeight
          isLiveboardMasterpiecesEnabled
          customizations={tsCustomizations(false)}
          {...LIVEBOARD_EMBED_FLAGS}
        />
      </div>

      <SpotterModal open={spotterOpen} onClose={() => setSpotterOpen(false)} />
    </div>
  );
}
