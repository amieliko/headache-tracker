"use client";

import type { LocalEvent } from "@/lib/db";

const colorMap: Record<string, string> = {
  mild: "var(--mild)",
  rough: "var(--rough)",
  brutal: "var(--brutal)",
};

interface PainRibbonProps {
  readings: LocalEvent[];
}

export function PainRibbon({ readings }: PainRibbonProps) {
  if (readings.length === 0) {
    return (
      <div className="w-full h-2 rounded-full bg-line/50" />
    );
  }

  return (
    <div className="flex w-full h-2 rounded-full overflow-hidden">
      {readings.map((r) => (
        <div
          key={r.id}
          className="flex-1"
          style={{ backgroundColor: colorMap[r.value_text ?? "mild"] }}
        />
      ))}
    </div>
  );
}
