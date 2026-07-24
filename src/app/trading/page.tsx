import { redirect } from "next/navigation";
import { isAdminAuthenticatedServer } from "@/lib/admin-auth.server";
import TradingPageClient from "./TradingPageClient";

export default async function TradingTabPage() {
  if (!(await isAdminAuthenticatedServer())) redirect("/login");
  return <TradingPageClient />;
}
