"use client";

import { useCallback, useRef } from "react";
import { quickLog } from "@/lib/events";
import { emit } from "@/lib/emitter";
import { flash } from "@/lib/flash";

const chips = [
  { kind: "advil", label: "Advil", color: "var(--advil)" },
  { kind: "water", label: "Water", color: "var(--water)" },
  { kind: "coffee", label: "Coffee", color: "var(--coffee)" },
];

interface QuickLogChipsProps {
  userId: string;
  episodeId?: string | null;
}

export function QuickLogChips({ userId, episodeId }: QuickLogChipsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleTap = useCallback(
    async (kind: string, index: number) => {
      const el = refs.current[index];
      if (el) flash(el);
      await quickLog(userId, kind, episodeId);
      emit(`logged:${kind}`);
    },
    [userId, episodeId]
  );

  return (
    <div className="flex gap-3">
      {chips.map((c, i) => (
        <button
          key={c.kind}
          ref={(el) => { refs.current[i] = el; }}
          onClick={() => handleTap(c.kind, i)}
          className="tap-flash px-4 py-2 rounded-full bg-bg2 border border-line text-sm
                     transition-transform duration-150 active:scale-95
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-glow/50"
          style={{ color: c.color }}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
