"use client";

import { useRef } from "react";

interface OrbProps {
  onTap: () => void;
}

export function Orb({ onTap }: OrbProps) {
  const rippleRef = useRef<HTMLSpanElement>(null);

  const handleClick = () => {
    if (rippleRef.current) {
      rippleRef.current.classList.remove("animate-[ripple_0.6s_ease-out]");
      void rippleRef.current.offsetWidth;
      rippleRef.current.classList.add("animate-[ripple_0.6s_ease-out]");
    }
    onTap();
  };

  return (
    <button
      onClick={handleClick}
      className="relative w-52 h-52 rounded-full bg-bg2 border border-line
                 flex items-center justify-center overflow-hidden
                 transition-transform duration-200 active:scale-95
                 hover:border-glow/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-glow/50"
      aria-label="Log a headache"
    >
      <span
        ref={rippleRef}
        className="absolute inset-0 rounded-full bg-glow/10 scale-0 opacity-100 pointer-events-none"
      />
      <span className="text-muted font-display text-xl text-center leading-snug px-6">
        I have a headache
      </span>
    </button>
  );
}
