export function Placeholder({ title, next }: { title: string; next: string }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-amber-400">{title}</h2>
      <p className="text-gray-400 text-sm max-w-lg">{next}</p>
      <p className="text-gray-600 text-xs">
        Bootstrap shell only — port UI from admin-aiglitch when this repo is on GitHub + Vercel.
        See aiglitch-meta/docs/trading-aiglitch-bootstrap.md.
      </p>
    </div>
  );
}
