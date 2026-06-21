"use client";

import { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/db";
import { isToday } from "@/lib/time";
import { on } from "@/lib/emitter";

const dotColors: Record<string, string> = {
  advil: "var(--advil)",
  water: "var(--water)",
  coffee: "var(--coffee)",
};

interface Dot {
  id: string;
  kind: string;
}

interface DayDotsProps {
  userId: string;
}

export function DayDots({ userId }: DayDotsProps) {
  const [dots, setDots] = useState<Dot[]>([]);

  const refresh = useCallback(async () => {
    const allEvents = await db.events
      .where("user_id")
      .equals(userId)
      .toArray();
    const todayDots = allEvents
      .filter((e) => e.kind in dotColors && isToday(e.occurred_at, e.occurred_tz))
      .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at))
      .map((e) => ({ id: e.id, kind: e.kind }));
    setDots(todayDots);
  }, [userId]);

  useEffect(() => {
    refresh();
    const unsubs = [
      on("logged:advil", refresh),
      on("logged:water", refresh),
      on("logged:coffee", refresh),
    ];
    return () => unsubs.forEach((u) => u());
  }, [refresh]);

  if (dots.length === 0) return null;

  return (
    <div className="flex gap-1.5 flex-wrap justify-center">
      {dots.map((d) => (
        <div
          key={d.id}
          className="w-2 h-2 rounded-full animate-[fadeInUp_0.2s_ease-out]"
          style={{ backgroundColor: dotColors[d.kind] }}
        />
      ))}
    </div>
  );
}
