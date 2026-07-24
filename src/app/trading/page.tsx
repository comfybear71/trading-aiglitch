import { redirect } from "next/navigation";

/** Legacy URL — bot fleet lives under Ops. */
export default function TradingRedirectPage() {
  redirect("/ops");
}
