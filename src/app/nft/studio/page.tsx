import { redirect } from "next/navigation";
import { isAdminAuthenticatedServer } from "@/lib/admin-auth.server";
import NftStudioClient from "../NftStudioClient";

export default async function NftStudioPage() {
  if (!(await isAdminAuthenticatedServer())) redirect("/login?next=/nft/studio");
  return <NftStudioClient />;
}
