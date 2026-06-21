"use client";

import { useState, useCallback } from "react";
import { logNote } from "@/lib/events";
import { emit } from "@/lib/emitter";

interface NoteFieldProps {
  userId: string;
  episodeId?: string | null;
}

export function NoteField({ userId, episodeId }: NoteFieldProps) {
  const [text, setText] = useState("");
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    await logNote(userId, trimmed, episodeId);
    setText("");
    setExpanded(false);
    emit("logged:note");
  }, [userId, episodeId, text]);

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-faint text-sm hover:text-muted transition-colors"
      >
        + add a note
      </button>
    );
  }

  return (
    <div className="w-full max-w-sm flex flex-col gap-2 animate-[fadeInUp_0.2s_ease-out]">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="anything to remember..."
        autoFocus
        rows={2}
        className="w-full bg-bg2 border border-line rounded-xl px-4 py-3
                   text-sm text-text placeholder:text-faint
                   resize-none focus:outline-none focus:border-glow/30"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => { setExpanded(false); setText(""); }}
          className="text-faint text-xs hover:text-muted"
        >
          cancel
        </button>
        <button
          onClick={handleSubmit}
          className="text-muted text-xs hover:text-text"
        >
          save
        </button>
      </div>
    </div>
  );
}
