"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { logPain, getEpisodePainReadings } from "@/lib/events";
import { emit } from "@/lib/emitter";
import { flash } from "@/lib/flash";
import { PainRibbon } from "./PainRibbon";
import type { LocalEvent } from "@/lib/db";

const levels = [
  { key: "mild" as const, label: "mild", cssVar: "--mild" },
  { key: "rough" as const, label: "rough", cssVar: "--rough" },
  { key: "brutal" as const, label: "brutal", cssVar: "--brutal" },
];

interface PainSectionProps {
  userId: string;
  episodeId: string;
}

export function PainSection({ userId, episodeId }: PainSectionProps) {
  const [readings, setReadings] = useState<LocalEvent[]>([]);
  const [visible, setVisible] = useState(false);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    getEpisodePainReadings(episodeId).then(setReadings);
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, [episodeId]);

  const handleLevel = useCallback(
    async (level: "mild" | "rough" | "brutal", index: number) => {
      const el = refs.current[index];
      if (el) flash(el);
      await logPain(userId, episodeId, level);
      const updated = await getEpisodePainReadings(episodeId);
      setReadings(updated);
      emit("logged:pain");
    },
    [userId, episodeId]
  );

  if (!visible && readings.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-4 w-full animate-[fadeInUp_0.3s_ease-out]">
      <p className="text-muted text-sm font-display">how does it feel?</p>
      <div className="flex gap-3">
        {levels.map((l, i) => (
          <button
            key={l.key}
            ref={(el) => { refs.current[i] = el; }}
            onClick={() => handleLevel(l.key, i)}
            className="tap-flash px-5 py-2 rounded-full border border-line text-sm
                       transition-transform duration-150 active:scale-95
                       focus:outline-none focus-visible:ring-2"
            style={{
              color: `var(${l.cssVar})`,
              outlineColor: `var(${l.cssVar})`,
            }}
          >
            {l.label}
          </button>
        ))}
      </div>
      <PainRibbon readings={readings} />
    </div>
  );
}
