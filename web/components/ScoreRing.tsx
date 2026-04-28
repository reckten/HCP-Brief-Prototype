export default function ScoreRing({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 80 ? "#6E7E28" : pct >= 60 ? "#C85C1E" : "#CE0058";
  const label = pct >= 80 ? "ADEQUATE" : pct >= 60 ? "REVIEW" : "RISK";

  return (
    <svg width="124" height="124" viewBox="0 0 124 124">
      <circle cx="62" cy="62" r={r} fill="none" stroke="#E8ECF2" strokeWidth="10" />
      <circle
        cx="62"
        cy="62"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 62 62)"
      />
      <text
        x="62"
        y="57"
        textAnchor="middle"
        fontSize="26"
        fontWeight="800"
        fontFamily="var(--font-josefin), Century Gothic, sans-serif"
        fill="#1A2235"
      >
        {pct}
      </text>
      <text
        x="62"
        y="72"
        textAnchor="middle"
        fontSize="9"
        fontWeight="600"
        fontFamily="Inter, sans-serif"
        fill="#8A95A8"
        letterSpacing="0.08em"
      >
        {label}
      </text>
    </svg>
  );
}
