import { SpotterEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { WORKSHEET_ID, SPOTTER_EMBED_FLAGS } from '../config';
import { tsCustomizations } from '../lib/thoughtspot';

// Cast to allow the extra spotter flags from salesloft_fin.json.
const Spotter = SpotterEmbed as unknown as (props: any) => JSX.Element;

export default function AskSalesloft() {
  return (
    <div className="tab-ask">
      <div className="ask-embed-wrapper">
        {/* String customization replaces "Spotter" -> "Salesloft AI" everywhere */}
        <Spotter
          worksheetId={WORKSHEET_ID}
          frameParams={{ width: '100%', height: '100%' }}
          customizations={tsCustomizations(true)}
          {...SPOTTER_EMBED_FLAGS}
        />
      </div>
    </div>
  );
}
