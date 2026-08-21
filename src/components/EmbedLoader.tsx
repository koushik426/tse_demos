// Branded loading overlay that sits ON TOP of a ThoughtSpot embed's iframe
// (parent must be position:relative) so the SDK's default ellipsis spinner is
// hidden behind the single-S SalesSpot mark until the embed reports ready.
interface Props {
  visible: boolean;
  label?: string;
}

export default function EmbedLoader({ visible, label = 'Loading…' }: Props) {
  if (!visible) return null;
  return (
    <div className="embed-loader" role="status" aria-live="polite">
      <img
        className="embed-loader-mark"
        src="/salesspot-icon.svg"
        alt=""
        width={56}
        height={56}
      />
      <span className="embed-loader-label">{label}</span>
    </div>
  );
}
