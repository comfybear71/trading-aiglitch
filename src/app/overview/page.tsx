import { redirect } from "next/navigation";
import { isAdminAuthenticatedServer } from "@/lib/admin-auth.server";
import { Placeholder } from "@/components/placeholder";

export default async function OverviewGatePage() {
  if (!(await isAdminAuthenticatedServer())) redirect("/login");

  return (
    <Placeholder
      title="Trading hub"
      next="BUDJU bot, GLITCH trading, persona wallets, and NFT marketplace will live here — same API proxy pattern as marketing.aiglitch.app."
    />
  );
}
