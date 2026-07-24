import { redirect } from "next/navigation";
import { isAdminAuthenticatedServer } from "@/lib/admin-auth.server";
import { DEFAULT_SLUG } from "../nav";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await isAdminAuthenticatedServer()) redirect(`/${DEFAULT_SLUG}`);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">{"\u{1F4C8}"}</div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
            AIG!itch Trading
          </h1>
          <p className="text-gray-500 text-sm mt-1">Trading &amp; NFT</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
