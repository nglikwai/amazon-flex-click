import React, { useRef, useCallback, useEffect } from 'react';

interface Props {
  label: string;
  valueMs: number;
  minMs: number;
  maxMs: number;
  stepMs: number;
  onChange: (ms: number) => void;
}

export default function DragSlider({ label, valueMs, minMs, maxMs, stepMs, onChange }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const clamp = (v: number) =>
    Math.round(Math.max(minMs, Math.min(maxMs, v)) / stepMs) * stepMs;

  const fromClientX = useCallback((clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return valueMs;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return clamp(minMs + ratio * (maxMs - minMs));
  }, [minMs, maxMs, stepMs, valueMs]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragging.current) onChange(fromClientX(e.clientX));
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [fromClientX, onChange]);

  const pct = ((valueMs - minMs) / (maxMs - minMs)) * 100;
  const display = (valueMs / 1000).toFixed(1) + 's';

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gh-text-muted uppercase tracking-widest">{label}</span>
        <span className="text-sm font-mono font-bold text-gh-accent tabular-nums">{display}</span>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="relative h-8 flex items-center cursor-ew-resize group"
        onMouseDown={(e) => {
          e.preventDefault();
          dragging.current = true;
          onChange(fromClientX(e.clientX));
        }}
      >
        {/* Rail */}
        <div className="w-full h-[3px] rounded-full bg-gh-bg-tertiary">
          {/* Fill */}
          <div
            className="h-full rounded-full bg-gradient-to-r from-gh-accent/70 to-gh-accent"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Handle */}
        <div
          className="absolute w-4 h-4 rounded-full bg-gh-accent border-2 border-gh-bg shadow-lg -translate-x-1/2 transition-transform group-hover:scale-110 group-active:scale-95"
          style={{ left: `${pct}%` }}
        />
      </div>

    </div>
  );
}
