import { cookies } from "next/headers";

const ADMIN_COOKIE = "aiglitch-admin-token";

export async function isAdminAuthenticatedServer(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get(ADMIN_COOKIE)?.value);
}
