// Create flow — opens a freshly TML-imported empty liveboard in edit mode.
// The liveboard is created in lib/thoughtspot.ts (metadata/tml/import), then we
// fire HostEvent.Edit once it loads.
// HostEvent: https://developers.thoughtspot.com/docs/Enumeration_HostEvent
import { useRef } from 'react';
import { LiveboardEmbed, useEmbedRef } from '@thoughtspot/visual-embed-sdk/react';
import { HostEvent } from '@thoughtspot/visual-embed-sdk';
import { ArrowLeft } from 'lucide-react';
import { LIVEBOARD_EMBED_FLAGS, SPOTTER_VIZ_CONFIG } from '../config';
import { tsCustomizations } from '../lib/thoughtspot';
import { useTheme } from '../context/ThemeContext';

const Liveboard = LiveboardEmbed as any;

export default function CreateBoard({
  liveboardId,
  onBack,
}: {
  liveboardId: string;
  onBack: () => void;
}) {
  const { theme } = useTheme();
  const embedRef = useEmbedRef<typeof LiveboardEmbed>();
  const editedRef = useRef(false);

  // An empty liveboard never fires LiveboardRendered — use onLoad, then trigger
  // Edit after a short delay so ThoughtSpot's handlers are ready (opens edit
  // mode with the SpotterViz panel).
  function handleLoad() {
    if (editedRef.current) return;
    editedRef.current = true;
    setTimeout(() => {
      try {
        embedRef.current?.trigger(HostEvent.Edit);
      } catch {
        /* ignore */
      }
    }, 1500);
  }

  return (
    <div className="hw-reports-selected">
      <div className="hw-reports-toolbar">
        <button className="hw-back-btn" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <h2 className="hw-reports-selected-title">New Dashboard</h2>
      </div>
      <div className="hw-liveboard-wrapper">
        <Liveboard
          key={theme}
          ref={embedRef}
          liveboardId={liveboardId}
          {...LIVEBOARD_EMBED_FLAGS}
          spotterViz={SPOTTER_VIZ_CONFIG}
          frameParams={{ width: '100%' }}
          customizations={tsCustomizations(theme)}
          onLoad={handleLoad}
        />
      </div>
    </div>
  );
}
