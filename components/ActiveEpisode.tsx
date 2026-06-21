"use client";

import { useEffect, useState } from "react";
import { formatLocalTime, getLocalTimezone } from "@/lib/time";
import { ItsGone } from "./ItsGone";
import { PainSection } from "./PainSection";
import type { LocalEpisode } from "@/lib/db";

interface ActiveEpisodeProps {
  episode: LocalEpisode;
  userId: string;
  onEnd: () => void;
}

function formatElapsed(startIso: string): string {
  const startMs = new Date(startIso).getTime();
  const elapsed = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
  const mins = Math.floor(elapsed / 60);
  if (mins < 1) {
    const tz = getLocalTimezone();
    return `started at ${formatLocalTime(startIso, tz)}`;
  }
  if (mins < 60) {
    return `${mins} minute${mins === 1 ? "" : "s"}`;
  }
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

export function ActiveEpisode({ episode, userId, onEnd }: ActiveEpisodeProps) {
  const [elapsed, setElapsed] = useState(() =>
    formatElapsed(episode.started_at)
  );

  useEffect(() => {
    const tick = setInterval(() => {
      setElapsed(formatElapsed(episode.started_at));
    }, 1000);
    return () => clearInterval(tick);
  }, [episode.started_at]);

  return (
    <div className="flex flex-col items-center w-80">
      {/* Fixed-height slot for "it's gone" + elapsed */}
      <div className="flex flex-col items-center gap-1 w-full">
        <ItsGone onTap={onEnd} />
        <p className="text-faint text-xs self-end mr-2">{elapsed}</p>
      </div>

      {/* Fixed-height slot for pain section — always reserves space */}
      <div className="h-28 flex flex-col items-center justify-center w-full mt-4">
        <PainSection userId={userId} episodeId={episode.id} />
      </div>
    </div>
  );
}
