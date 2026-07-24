import { redirect } from "next/navigation";
import { isAdminAuthenticatedServer } from "@/lib/admin-auth.server";
import NftMarketplaceClient from "./NftMarketplaceClient";

export default async function NftPage() {
  if (!(await isAdminAuthenticatedServer())) redirect("/login");
  return <NftMarketplaceClient />;
}
