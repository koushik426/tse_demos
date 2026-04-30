import { LiveboardEmbed, useEmbedRef } from '@thoughtspot/visual-embed-sdk/react';
import Header from '../components/Header';

const LIVEBOARD_ID = 'ae674601-94b8-4c6f-a326-59e9bed2c401';
const ACTIVE_TAB_ID = 'd0254661-b0a0-4ca1-b13e-845299deda8f';
const SL_FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

export default function Dashboard() {
  const embedRef = useEmbedRef<typeof LiveboardEmbed>();

  return (
    <>
      <Header
        title="Sales Dashboard"
        subtitle="Live performance metrics and pipeline analytics"
      />
      <main className="main-content">
        <div className="page-container">
          <div className="page-header">
            <h2 className="page-title">Sales Performance</h2>
            <p className="page-subtitle">
              Pipeline health, rep activity, deal velocity, and revenue attainment
            </p>
          </div>
          <div style={{ width: '100%' }}>
            <LiveboardEmbed
              ref={embedRef}
              liveboardId={LIVEBOARD_ID}
              activeTabId={ACTIVE_TAB_ID}
              isLiveboardMasterpiecesEnabled={true}
              fullHeight={true}
              frameParams={{ width: '100%' }}
              customizations={{
                style: {
                  customCSS: {
                    variables: {
                      '--ts-var-root-background': 'transparent',
                      '--ts-var-viz-background': '#ffffff',
                      '--ts-var-root-font-family': SL_FONT,
                      '--ts-var-button--primary-background': '#4B75FD',
                      '--ts-var-button--primary-color': '#ffffff',
                    },
                    rules_UNSTABLE: {
                      '.footer-module__footerLogo': { display: 'none !important' },
                      '.footer-module__footer': { display: 'none !important' },
                      "[class*='footer-module']": { display: 'none !important' },
                      'body, .bk-root, *': { fontFamily: `${SL_FONT} !important` },
                      body: { backgroundColor: 'transparent !important' },
                      '.pinboard-background': { backgroundColor: 'transparent !important' },
                      '.ReactGridLayout': { backgroundColor: 'transparent !important' },
                      '.pinboard-content-module__pinboardContent': { backgroundColor: 'transparent !important' },
                      '.pinboard-module__pinboard': { backgroundColor: 'transparent !important' },
                      '.embed-module__embedContainer': { backgroundColor: 'transparent !important' },
                      '.answer-module__answer': {
                        border: 'none !important',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08) !important',
                        borderRadius: '10px !important',
                        overflow: 'hidden !important',
                      },
                      '.viz-card-module__vizCard': {
                        border: 'none !important',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08) !important',
                        borderRadius: '10px !important',
                        overflow: 'hidden !important',
                      },
                      '.react-grid-item': { border: 'none !important' },
                    },
                  },
                },
              }}
              onLoad={() => console.log('Liveboard loaded')}
              onError={(e: unknown) => console.error('Liveboard error', e)}
            />
          </div>
        </div>
      </main>
    </>
  );
}
