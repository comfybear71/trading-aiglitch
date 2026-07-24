import { redirect } from "next/navigation";
import { isAdminAuthenticatedServer } from "@/lib/admin-auth.server";
import { Placeholder } from "@/components/placeholder";

export default async function NftPage() {
  if (!(await isAdminAuthenticatedServer())) redirect("/login");

  return (
    <Placeholder
      title="NFT Art"
      next="Next step: port admin-aiglitch/src/app/nft-marketplace/ (Grokify grid + marketplace tools)."
    />
  );
}
