"use client";

import { useEffect, useState, useCallback } from "react";
import { db, type LocalEpisode, type LocalEvent } from "@/lib/db";
import { formatLocalTime, formatLocalDate, formatDuration, isToday } from "@/lib/time";
import { on } from "@/lib/emitter";
import { PainRibbon } from "./PainRibbon";

interface DayGroup {
  label: string;
  episodes: {
    episode: LocalEpisode;
    painReadings: LocalEvent[];
    meds: LocalEvent[];
  }[];
}

interface HistorySheetProps {
  userId: string;
  open: boolean;
  onClose: () => void;
}

export function HistorySheet({ userId, open, onClose }: HistorySheetProps) {
  const [groups, setGroups] = useState<DayGroup[]>([]);

  const load = useCallback(async () => {
    const episodes = await db.episodes
      .where("user_id")
      .equals(userId)
      .reverse()
      .sortBy("started_at");

    const allEvents = await db.events
      .where("user_id")
      .equals(userId)
      .toArray();

    const dayMap = new Map<string, DayGroup>();

    for (const ep of episodes) {
      const dayKey = formatLocalDate(ep.started_at, ep.started_tz);
      const label = isToday(ep.started_at, ep.started_tz) ? "Today" : dayKey;

      if (!dayMap.has(dayKey)) {
        dayMap.set(dayKey, { label, episodes: [] });
      }

      const epEvents = allEvents.filter((e) => e.episode_id === ep.id);
      dayMap.get(dayKey)!.episodes.push({
        episode: ep,
        painReadings: epEvents
          .filter((e) => e.kind === "pain")
          .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at)),
        meds: epEvents.filter((e) =>
          ["advil", "water", "coffee"].includes(e.kind)
        ),
      });
    }

    setGroups(Array.from(dayMap.values()));
  }, [userId]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  useEffect(() => {
    const unsub = on("logged:episode-end", load);
    return unsub;
  }, [load]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="bg-bg border-t border-line rounded-t-2xl max-h-[70dvh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line sticky top-0 bg-bg z-10">
          <h2 className="font-display text-lg text-text">History</h2>
          <button onClick={onClose} className="text-faint hover:text-muted text-sm">
            close
          </button>
        </div>

        <div className="px-6 py-4">
          {groups.length === 0 ? (
            <p className="text-faint text-sm text-center py-8">
              no episodes yet
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="mb-6">
                <p className="text-faint text-xs uppercase tracking-wider mb-3">
                  {group.label}
                </p>
                {group.episodes.map(({ episode, painReadings, meds }) => (
                  <div
                    key={episode.id}
                    className="mb-4 p-3 rounded-xl bg-bg2 border border-line"
                  >
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-sm text-text">
                        {formatLocalTime(episode.started_at, episode.started_tz)}
                      </span>
                      <span className="text-xs text-muted">
                        {episode.ended_at
                          ? formatDuration(episode.started_at, episode.ended_at)
                          : "ongoing"}
                      </span>
                    </div>
                    {painReadings.length > 0 && (
                      <div className="mb-2">
                        <PainRibbon readings={painReadings} />
                      </div>
                    )}
                    {meds.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
                        {meds.map((m) => (
                          <span
                            key={m.id}
                            className="text-xs px-2 py-0.5 rounded-full border border-line"
                            style={{
                              color: `var(--${m.kind})`,
                            }}
                          >
                            {m.kind}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
