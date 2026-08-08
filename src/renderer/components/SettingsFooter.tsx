import React from 'react';

interface Props {
  mouseX: number;
  mouseY: number;
  onCancel: () => void;
  onSave: () => void;
}

export default function SettingsFooter({ mouseX, mouseY, onCancel, onSave }: Props) {
  return (
    <footer className="sticky bottom-0 z-10 backdrop-blur-md bg-gh-bg/60 border-t border-gh-border/50 px-6 py-3">
      <div className="flex items-center gap-4">
        {/* Mouse position */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gh-bg-tertiary/60 border border-gh-border/50 font-mono text-xs">
          <span className="text-gh-text-muted">XY</span>
          <span className="text-gh-accent tabular-nums">{mouseX}</span>
          <span className="text-gh-border">·</span>
          <span className="text-gh-accent tabular-nums">{mouseY}</span>
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gh-text-secondary hover:text-gh-text bg-gh-bg-tertiary/60 hover:bg-gh-bg-tertiary border border-gh-border/60 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          className="px-4 py-2 text-sm font-medium text-white bg-gh-accent/90 hover:bg-gh-accent border border-gh-accent/40 rounded-lg transition-all hover:glow-accent"
        >
          Save
        </button>
      </div>
    </footer>
  );
}
