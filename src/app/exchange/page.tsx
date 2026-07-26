import { redirect } from "next/navigation";

/** Legacy URL — §GLITCH OTC lives at /glitch */
export default function ExchangeRedirectPage() {
  redirect("/glitch");
}
