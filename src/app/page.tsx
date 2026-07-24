import { redirect } from "next/navigation";
import { DEFAULT_SLUG } from "./nav";

export default function HomePage() {
  redirect(`/${DEFAULT_SLUG}`);
}
