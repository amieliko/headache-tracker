"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { DateTime } from "luxon";
import { ensureUser } from "@/lib/auth";
import { logHeadache, endEpisode, getOpenEpisode } from "@/lib/events";
import { startBackgroundSync } from "@/lib/sync";
import { registerServiceWorker } from "@/lib/sw-register";
import { emit } from "@/lib/emitter";
import { getLocalTimezone } from "@/lib/time";
import { Orb } from "./Orb";
import { ActiveEpisode } from "./ActiveEpisode";
import { QuickLogChips } from "./QuickLogChips";
import { DayDots } from "./DayDots";
import { PeriodToggle } from "./PeriodToggle";
import { NoteField } from "./NoteField";
import { Menu } from "./Menu";
import { HistorySheet } from "./HistorySheet";
import { Onboarding } from "./Onboarding";
import type { LocalEpisode } from "@/lib/db";

const ONBOARDING_KEY = "headache-tracker:onboarded";
const TRANSITION_MS = 1200;

function todayLabel(): string {
  return DateTime.now().setZone(getLocalTimezone()).toFormat("EEEE, MMMM d");
}

type Phase = "resting" | "leaving-resting" | "active" | "leaving-active";

export function Tracker() {
  const [userId, setUserId] = useState<string | null>(null);
  const [episode, setEpisode] = useState<LocalEpisode | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dateLabel] = useState(todayLabel);
  const [phase, setPhase] = useState<Phase>("resting");
  const pendingEpisode = useRef<LocalEpisode | null>(null);

  useEffect(() => {
    registerServiceWorker();
    ensureUser().then(async (uid) => {
      setUserId(uid);
      const open = await getOpenEpisode(uid);
      if (open) {
        setEpisode(open);
        setPhase("active");
      }
      setLoading(false);

      if (!localStorage.getItem(ONBOARDING_KEY)) {
        setShowOnboarding(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    return startBackgroundSync();
  }, [userId]);

  const handleStart = useCallback(async () => {
    if (!userId || phase !== "resting") return;
    const ep = await logHeadache(userId);
    pendingEpisode.current = ep;
    emit("logged:episode-start");
    setPhase("leaving-resting");
    setTimeout(() => {
      setEpisode(pendingEpisode.current);
      setPhase("active");
    }, TRANSITION_MS / 2);
  }, [userId, phase]);

  const handleEnd = useCallback(async () => {
    if (!episode || phase !== "active") return;
    await endEpisode(episode.id);
    emit("logged:episode-end");
    setPhase("leaving-active");
    setTimeout(() => {
      setEpisode(null);
      setPhase("resting");
    }, TRANSITION_MS / 2);
  }, [episode, phase]);

  const dismissOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    setShowOnboarding(false);
  }, []);

  const menuItems = [
    { label: "history", onTap: () => setHistoryOpen(true) },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-glow/40 animate-pulse" />
      </div>
    );
  }

  const isActive = phase === "active" || phase === "leaving-active";

  const heroAnimation =
    phase === "leaving-resting" || phase === "leaving-active"
      ? `scaleDown ${TRANSITION_MS / 2}ms ease-in forwards`
      : phase === "active" || phase === "resting"
      ? "phaseIn 0.6s ease-out"
      : undefined;

  return (
    <>
      <main className="flex-1 flex flex-col px-6 relative">
        {/* Top bar: date + menu */}
        <div className="flex items-center justify-between pt-6 pb-4">
          <div />
          <p className="text-faint text-sm">{dateLabel}</p>
          <Menu items={menuItems} />
        </div>

        {/* Hero zone — fixed position in the layout */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Primary button area — fixed height so nothing shifts */}
          <div className="h-72 flex items-center justify-center">
            <div style={{ animation: heroAnimation }}>
              {isActive && episode ? (
                <ActiveEpisode
                  episode={episode}
                  userId={userId!}
                  onEnd={handleEnd}
                />
              ) : (
                <Orb onTap={handleStart} />
              )}
            </div>
          </div>

          {/* Remedy chips — always in the same spot */}
          <div className="mt-10">
            <QuickLogChips userId={userId!} episodeId={episode?.id} />
          </div>

          {/* Day dots */}
          <div className="mt-6">
            <DayDots userId={userId!} />
          </div>

          {/* Period + note — always at the bottom of center content */}
          <div className="mt-6">
            <PeriodToggle userId={userId!} />
          </div>
          <div className="mt-4 pb-8">
            <NoteField userId={userId!} episodeId={episode?.id} />
          </div>
        </div>
      </main>

      <HistorySheet
        userId={userId!}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />

      {showOnboarding && <Onboarding onDismiss={dismissOnboarding} />}
    </>
  );
}
