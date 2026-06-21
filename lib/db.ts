import Dexie, { type EntityTable } from "dexie";

export interface LocalEpisode {
  id: string;
  user_id: string;
  kind: string;
  started_at: string;
  ended_at?: string | null;
  started_tz: string;
  synced: 0 | 1;
}

export interface LocalEvent {
  id: string;
  user_id: string;
  episode_id?: string | null;
  kind: string;
  value_text?: string | null;
  value_num?: number | null;
  metadata: Record<string, unknown>;
  occurred_at: string;
  occurred_tz: string;
  synced: 0 | 1;
}

export interface LocalCycle {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string | null;
  synced: 0 | 1;
}

class TrackerDB extends Dexie {
  episodes!: EntityTable<LocalEpisode, "id">;
  events!: EntityTable<LocalEvent, "id">;
  cycles!: EntityTable<LocalCycle, "id">;

  constructor() {
    super("headache-tracker");
    this.version(1).stores({
      episodes: "id, user_id, started_at, synced",
      events: "id, user_id, episode_id, occurred_at, synced",
      cycles: "id, user_id, started_at, synced",
    });
  }
}

export const db = new TrackerDB();
