import Link from "next/link";

export default function Nav({ subtitle }: { subtitle?: string }) {
  return (
    <nav
      className="h-14 px-10 flex items-center gap-3 border-b border-white/10"
      style={{ background: "var(--ink)" }}
    >
      <div className="flex gap-1 items-center">
        <div className="w-2.5 h-2.5 rounded-full border-2 border-white/40" />
        <div className="w-2.5 h-2.5 rounded-full border-2 border-white/40" />
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: "var(--olive2)", borderColor: "var(--olive2)" }}
        />
      </div>
      <div className="w-px h-5 bg-white/20 mx-1" />
      <Link
        href="/"
        className="text-white font-brand font-extrabold text-base tracking-tight hover:opacity-80 transition-opacity"
        style={{ fontFamily: "var(--font-nunito), Century Gothic, Futura, sans-serif" }}
      >
        Relevate Health
      </Link>
      {subtitle && (
        <>
          <div className="w-px h-5 bg-white/20 mx-1" />
          <span className="text-white/40 text-xs">{subtitle}</span>
        </>
      )}
    </nav>
  );
}
