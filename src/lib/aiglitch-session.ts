const SESSION_KEY = "aiglitch-session";

/** Same session key as aiglitch.app — creates one if missing (matches inbox/meatlab pattern). */
export function ensureAiglitchSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function getAiglitchSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}
