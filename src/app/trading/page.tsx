import { redirect } from "next/navigation";
import { isAdminAuthenticatedServer } from "@/lib/admin-auth.server";
import { Placeholder } from "@/components/placeholder";

export default async function TradingTabPage() {
  if (!(await isAdminAuthenticatedServer())) redirect("/login");

  return (
    <Placeholder
      title="Trading"
      next="Next step: copy admin-aiglitch/src/app/trading/ into this tab (Phantom QR auth + BUDJU/GLITCH views)."
    />
  );
}
