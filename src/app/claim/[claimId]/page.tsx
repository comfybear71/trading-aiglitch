import { ClaimClient } from "./ClaimClient";

type Props = { params: Promise<{ claimId: string }> };

export default async function ClaimPage({ params }: Props) {
  const { claimId } = await params;
  return (
    <div className="py-8 px-4">
      <ClaimClient claimId={claimId} />
    </div>
  );
}
