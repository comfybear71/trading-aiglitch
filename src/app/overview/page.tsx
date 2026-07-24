import { redirect } from "next/navigation";
import { isAdminAuthenticatedServer } from "@/lib/admin-auth.server";
import { Placeholder } from "@/components/placeholder";

export default async function OverviewGatePage() {
  if (!(await isAdminAuthenticatedServer())) redirect("/login");

  return (
    <Placeholder
      title="Trading hub"
      next="Use the sidebar: Trading (Phantom QR + BUDJU/GLITCH) and NFT Art (Grokify grid). All calls proxy to api.aiglitch.app."
    />
  );
}
