import React from 'react';

interface Props {
  mouseX: number;
  mouseY: number;
  onCancel: () => void;
  onSave: () => void;
}

export default function SettingsFooter({ mouseX, mouseY, onCancel, onSave }: Props) {
  return (
    <footer className="bg-gh-bg-secondary px-6 py-4 border-t border-gh-border">
      <div className="flex gap-4 justify-center items-center">
        <div className="flex-1 flex flex-col gap-1 px-4 py-2 bg-gh-bg-tertiary border border-gh-border rounded-lg mr-4">
          <div className="text-xs font-semibold text-gh-text-muted uppercase tracking-wider">Mouse Position</div>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gh-text-secondary">X:</span>
            <span className="text-lg font-bold font-mono text-gh-accent min-w-[60px]">{mouseX}</span>
            <span className="text-sm text-gh-text-secondary">Y:</span>
            <span className="text-lg font-bold font-mono text-gh-accent min-w-[60px]">{mouseY}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            className="px-5 py-2.5 bg-gh-bg-tertiary border border-gh-border text-gh-text rounded-lg font-medium hover:bg-gh-border transition-colors"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-5 py-2.5 bg-gh-accent hover:bg-gh-accent-emphasis text-white rounded-lg font-medium transition-colors"
            onClick={onSave}
          >
            Save Settings
          </button>
        </div>
      </div>
    </footer>
  );
}
