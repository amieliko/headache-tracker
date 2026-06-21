"use client";

import { useEffect, useState, useCallback } from "react";
import { on } from "@/lib/emitter";
import { formatLocalTime, getLocalTimezone } from "@/lib/time";

interface ToastMessage {
  id: number;
  text: string;
  time: string;
}

let nextId = 0;

export function Toast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string) => {
    const tz = getLocalTimezone();
    const time = formatLocalTime(new Date().toISOString(), tz);
    const id = nextId++;
    setMessages((prev) => [...prev, { id, text, time }]);
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }, 2500);
  }, []);

  useEffect(() => {
    const unsubs = [
      on("logged:pain", () => addToast("pain logged")),
      on("logged:advil", () => addToast("advil logged")),
      on("logged:water", () => addToast("water logged")),
      on("logged:coffee", () => addToast("coffee logged")),
      on("logged:note", () => addToast("note saved")),
      on("logged:episode-start", () => addToast("tracking started")),
      on("logged:episode-end", () => addToast("episode ended")),
      on("logged:period-start", () => addToast("period started")),
      on("logged:period-end", () => addToast("period ended")),
    ];
    return () => unsubs.forEach((u) => u());
  }, [addToast]);

  if (messages.length === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-50 pointer-events-none">
      {messages.map((m) => (
        <div
          key={m.id}
          className="px-4 py-2 rounded-full bg-bg2 border border-line text-sm text-muted
                     animate-[fadeInUp_0.2s_ease-out]"
        >
          {m.text}
          <span className="ml-2 text-faint text-xs">{m.time}</span>
        </div>
      ))}
    </div>
  );
}
