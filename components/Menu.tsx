"use client";

import { useState, useRef, useEffect } from "react";

interface MenuItem {
  label: string;
  onTap: () => void;
}

interface MenuProps {
  items: MenuItem[];
}

export function Menu({ items }: MenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 flex flex-col items-center justify-center gap-[3px]
                   hover:opacity-80 transition-opacity"
        aria-label="Menu"
      >
        <span className="w-1 h-1 rounded-full bg-faint" />
        <span className="w-1 h-1 rounded-full bg-faint" />
        <span className="w-1 h-1 rounded-full bg-faint" />
      </button>

      {open && (
        <div className="absolute top-10 right-0 bg-bg2 border border-line rounded-xl
                        py-1 min-w-[140px] shadow-lg animate-[fadeInUp_0.15s_ease-out] z-50">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setOpen(false);
                item.onTap();
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-muted
                         hover:text-text hover:bg-line/30 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
