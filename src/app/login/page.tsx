import { redirect } from "next/navigation";
import { isAdminAuthenticatedServer } from "@/lib/admin-auth.server";
import { LoginForm } from "./login-form";

function safeNext(next: string | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/ops";
  return next;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const redirectTo = safeNext(next);

  if (await isAdminAuthenticatedServer()) redirect(redirectTo);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="bg-[#0d0d14] border border-zinc-800 rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black">
            <span className="text-purple-400">AIG!</span>
            <span className="text-cyan-400">itch</span>
            <span className="text-zinc-400 font-normal text-lg"> Ops</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-2">
            Bot fleet, wallet dashboard, NFT studio tools
          </p>
        </div>
        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
