// Ask HiveWatch AI — the full Spotter natural-language experience with the
// updated chat prompt and past-conversations sidebar.
// Docs: https://developers.thoughtspot.com/docs/embed-spotter
// Config options: SpotterEmbedViewConfig / SpotterSidebarViewConfig in the SDK.
import { SpotterEmbed } from '@thoughtspot/visual-embed-sdk/react';
import { SPOTTER_WORKSHEET_ID } from '../config';
import { tsCustomizations } from '../lib/thoughtspot';
import { useTheme } from '../context/ThemeContext';

const Spotter = SpotterEmbed as any;

export default function AskAI() {
  const { theme } = useTheme();
  return (
    <div className="hw-embed-fill">
      <Spotter
        key={theme}
        worksheetId={SPOTTER_WORKSHEET_ID}
        updatedSpotterChatPrompt
        spotterSidebarConfig={{
          enablePastConversationsSidebar: true,
          spotterSidebarTitle: 'Conversations',
          spotterSidebarDefaultExpanded: true,
          spotterNewChatButtonTitle: 'New Chat',
        }}
        frameParams={{ width: '100%', height: '100%' }}
        customizations={tsCustomizations(theme)}
      />
    </div>
  );
}
