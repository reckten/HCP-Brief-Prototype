import Link from "next/link";

export default function Nav({ subtitle }: { subtitle?: string }) {
  return (
    <nav
      className="h-20 px-8 flex items-center gap-3 border-b"
      style={{ background: "white", borderColor: "var(--light)" }}
    >
      <Link
        href="/"
        className="flex items-center hover:opacity-75 transition-opacity"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Relevate Health"
          style={{ height: "64px", width: "auto" }}
        />
      </Link>

      {subtitle && (
        <>
          <div className="w-px h-5 mx-2" style={{ background: "var(--light)" }} />
          <span className="text-xs" style={{ color: "var(--mid)" }}>{subtitle}</span>
        </>
      )}
    </nav>
  );
}
