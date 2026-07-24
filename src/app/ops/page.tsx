import { redirect } from "next/navigation";
import { isAdminAuthenticatedServer } from "@/lib/admin-auth.server";
import TradingPageClient from "../trading/TradingPageClient";

export default async function OpsPage() {
  if (!(await isAdminAuthenticatedServer())) redirect("/login?next=/ops");
  return <TradingPageClient />;
}
