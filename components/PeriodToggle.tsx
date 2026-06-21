"use client";

import { useEffect, useState, useCallback } from "react";
import { startPeriod, endPeriod, getOpenCycle } from "@/lib/events";
import { emit } from "@/lib/emitter";

interface PeriodToggleProps {
  userId: string;
}

export function PeriodToggle({ userId }: PeriodToggleProps) {
  const [cycleId, setCycleId] = useState<string | null>(null);

  useEffect(() => {
    getOpenCycle(userId).then((c) => setCycleId(c?.id ?? null));
  }, [userId]);

  const toggle = useCallback(async () => {
    if (cycleId) {
      await endPeriod(cycleId);
      setCycleId(null);
      emit("logged:period-end");
    } else {
      const c = await startPeriod(userId);
      setCycleId(c.id);
      emit("logged:period-start");
    }
  }, [userId, cycleId]);

  const on = cycleId != null;

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2.5 group"
      role="switch"
      aria-checked={on}
      aria-label="Period tracking"
    >
      <span className={`text-sm transition-colors ${on ? "text-rough" : "text-faint"}`}>
        period
      </span>
      <div
        className={`relative w-10 h-[22px] rounded-full transition-colors duration-200
                     ${on ? "bg-rough/30" : "bg-line"}`}
      >
        <div
          className={`absolute top-[3px] w-4 h-4 rounded-full transition-all duration-200
                       ${on ? "left-[22px] bg-rough" : "left-[3px] bg-faint"}`}
        />
      </div>
    </button>
  );
}
