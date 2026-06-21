"use client";

interface ItsGoneProps {
  onTap: () => void;
}

export function ItsGone({ onTap }: ItsGoneProps) {
  return (
    <button
      onClick={onTap}
      className="w-full py-4 rounded-2xl bg-bg2 border border-line
                 text-text font-display text-lg
                 transition-transform duration-200 active:scale-[0.98]
                 hover:border-glow/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-glow/50"
    >
      it&apos;s gone
    </button>
  );
}
