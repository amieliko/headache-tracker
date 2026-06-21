import { db } from "./db";
import { getSupabase } from "./supabase";

let syncing = false;

export async function flushSyncQueue(): Promise<void> {
  if (syncing) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;

  syncing = true;
  try {
    const supabase = getSupabase();

    // Episodes first (events reference them via FK)
    const unsyncedEpisodes = await db.episodes
      .where("synced")
      .equals(0)
      .toArray();
    for (const ep of unsyncedEpisodes) {
      const { synced: _, ...row } = ep;
      const { error } = await supabase
        .from("episodes")
        .upsert(row, { onConflict: "id" });
      if (!error) {
        await db.episodes.update(ep.id, { synced: 1 });
      }
    }

    const unsyncedEvents = await db.events
      .where("synced")
      .equals(0)
      .toArray();
    for (const ev of unsyncedEvents) {
      const { synced: _, ...row } = ev;
      const { error } = await supabase
        .from("events")
        .upsert(row, { onConflict: "id" });
      if (!error) {
        await db.events.update(ev.id, { synced: 1 });
      }
    }

    const unsyncedCycles = await db.cycles
      .where("synced")
      .equals(0)
      .toArray();
    for (const c of unsyncedCycles) {
      const { synced: _, ...row } = c;
      const { error } = await supabase
        .from("cycles")
        .upsert(row, { onConflict: "id" });
      if (!error) {
        await db.cycles.update(c.id, { synced: 1 });
      }
    }
  } finally {
    syncing = false;
  }
}

export function startBackgroundSync(): () => void {
  const flush = () => {
    flushSyncQueue().catch(() => {});
  };

  flush();

  const interval = setInterval(flush, 30_000);

  const handleOnline = () => flush();
  const handleFocus = () => flush();
  const handleVisibility = () => {
    if (document.visibilityState === "visible") flush();
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("focus", handleFocus);
  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    clearInterval(interval);
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("focus", handleFocus);
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}
