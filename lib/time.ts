import { DateTime } from "luxon";

export function getLocalTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function nowUTC(): string {
  return new Date().toISOString();
}

export function startOfLocalDay(isoTimestamp: string, tz: string): string {
  return DateTime.fromISO(isoTimestamp, { zone: tz }).startOf("day").toISO()!;
}

export function isSameLocalDay(
  a: string,
  aTz: string,
  b: string,
  bTz: string
): boolean {
  const dayA = DateTime.fromISO(a, { zone: aTz }).startOf("day");
  const dayB = DateTime.fromISO(b, { zone: bTz }).startOf("day");
  return dayA.equals(dayB);
}

export function isToday(isoTimestamp: string, tz: string): boolean {
  const eventDay = DateTime.fromISO(isoTimestamp, { zone: tz }).startOf("day");
  const today = DateTime.now().setZone(tz).startOf("day");
  return eventDay.equals(today);
}

export function formatLocalTime(isoTimestamp: string, tz: string): string {
  return DateTime.fromISO(isoTimestamp, { zone: tz }).toFormat("h:mm a");
}

export function formatLocalDate(isoTimestamp: string, tz: string): string {
  return DateTime.fromISO(isoTimestamp, { zone: tz }).toFormat("EEE, MMM d");
}

export function durationMinutes(start: string, end: string): number {
  const s = DateTime.fromISO(start);
  const e = DateTime.fromISO(end);
  return e.diff(s, "minutes").minutes;
}

export function formatDuration(start: string, end?: string | null): string {
  const s = DateTime.fromISO(start);
  const e = end ? DateTime.fromISO(end) : DateTime.now();
  const diff = e.diff(s, ["hours", "minutes"]);
  const h = Math.floor(diff.hours);
  const m = Math.floor(diff.minutes);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}
