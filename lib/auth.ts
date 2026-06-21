import { getSupabase } from "./supabase";

const OFFLINE_USER_KEY = "headache-tracker:offline-uid";

async function ensureProfile(userId: string, tz: string): Promise<void> {
  const supabase = getSupabase();
  await supabase.from("profiles").upsert(
    { id: userId, home_timezone: tz },
    { onConflict: "id", ignoreDuplicates: true }
  );
}

export async function ensureUser(): Promise<string> {
  try {
    const supabase = getSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      localStorage.setItem(OFFLINE_USER_KEY, session.user.id);
      return session.user.id;
    }

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const { data, error } = await supabase.auth.signInAnonymously({
      options: { data: { timezone: tz } },
    });

    if (error || !data.user) {
      throw error ?? new Error("No user returned");
    }

    localStorage.setItem(OFFLINE_USER_KEY, data.user.id);
    await ensureProfile(data.user.id, tz);
    return data.user.id;
  } catch {
    // Offline or Supabase unreachable — use a stable local ID
    const existing = localStorage.getItem(OFFLINE_USER_KEY);
    if (existing) return existing;
    const offlineId = crypto.randomUUID();
    localStorage.setItem(OFFLINE_USER_KEY, offlineId);
    return offlineId;
  }
}

export async function getUserId(): Promise<string | null> {
  try {
    const supabase = getSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user?.id ?? localStorage.getItem(OFFLINE_USER_KEY);
  } catch {
    return localStorage.getItem(OFFLINE_USER_KEY);
  }
}
