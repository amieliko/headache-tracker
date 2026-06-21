import { db, type LocalEpisode, type LocalEvent, type LocalCycle } from "./db";
import { getLocalTimezone, nowUTC } from "./time";

function uuid(): string {
  return crypto.randomUUID();
}

export async function logHeadache(userId: string): Promise<LocalEpisode> {
  const episode: LocalEpisode = {
    id: uuid(),
    user_id: userId,
    kind: "headache",
    started_at: nowUTC(),
    ended_at: null,
    started_tz: getLocalTimezone(),
    synced: 0,
  };
  await db.episodes.add(episode);
  return episode;
}

export async function endEpisode(episodeId: string): Promise<void> {
  await db.episodes.update(episodeId, {
    ended_at: nowUTC(),
    synced: 0,
  });
}

export async function logPain(
  userId: string,
  episodeId: string,
  level: "mild" | "rough" | "brutal"
): Promise<LocalEvent> {
  const ordinal = { mild: 1, rough: 2, brutal: 3 }[level];
  const event: LocalEvent = {
    id: uuid(),
    user_id: userId,
    episode_id: episodeId,
    kind: "pain",
    value_text: level,
    value_num: ordinal,
    metadata: {},
    occurred_at: nowUTC(),
    occurred_tz: getLocalTimezone(),
    synced: 0,
  };
  await db.events.add(event);
  return event;
}

export async function quickLog(
  userId: string,
  kind: string,
  episodeId?: string | null
): Promise<LocalEvent> {
  const event: LocalEvent = {
    id: uuid(),
    user_id: userId,
    episode_id: episodeId ?? null,
    kind,
    value_text: null,
    value_num: null,
    metadata: {},
    occurred_at: nowUTC(),
    occurred_tz: getLocalTimezone(),
    synced: 0,
  };
  await db.events.add(event);
  return event;
}

export async function logNote(
  userId: string,
  text: string,
  episodeId?: string | null
): Promise<LocalEvent> {
  const event: LocalEvent = {
    id: uuid(),
    user_id: userId,
    episode_id: episodeId ?? null,
    kind: "note",
    value_text: text,
    value_num: null,
    metadata: {},
    occurred_at: nowUTC(),
    occurred_tz: getLocalTimezone(),
    synced: 0,
  };
  await db.events.add(event);
  return event;
}

export async function getOpenEpisode(
  userId: string
): Promise<LocalEpisode | undefined> {
  return db.episodes
    .where("user_id")
    .equals(userId)
    .filter((e) => e.ended_at == null)
    .first();
}

export async function getTodayEvents(
  userId: string
): Promise<LocalEvent[]> {
  const now = new Date();
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).toISOString();
  return db.events
    .where("user_id")
    .equals(userId)
    .filter((e) => e.occurred_at >= startOfDay)
    .toArray();
}

export async function getEpisodePainReadings(
  episodeId: string
): Promise<LocalEvent[]> {
  return db.events
    .where("episode_id")
    .equals(episodeId)
    .filter((e) => e.kind === "pain")
    .sortBy("occurred_at");
}

export async function startPeriod(userId: string): Promise<LocalCycle> {
  const cycle: LocalCycle = {
    id: uuid(),
    user_id: userId,
    started_at: nowUTC(),
    ended_at: null,
    synced: 0,
  };
  await db.cycles.add(cycle);
  return cycle;
}

export async function endPeriod(cycleId: string): Promise<void> {
  await db.cycles.update(cycleId, {
    ended_at: nowUTC(),
    synced: 0,
  });
}

export async function getOpenCycle(
  userId: string
): Promise<LocalCycle | undefined> {
  return db.cycles
    .where("user_id")
    .equals(userId)
    .filter((c) => c.ended_at == null)
    .first();
}
