import { EvalResult, StageTrace, Requirements } from "./schema.js";
import { writeFile } from "./fs.js";
import path from "path";

export interface ReportData {
  runId: string;
  requirements: Requirements;
  plan: string;
  deliveryPackage: string;
  testPlan: string;
  riskReview: string;
  evalResult: EvalResult;
  traces: StageTrace[];
}

// Relevate Health brand palette — brand guide (2024)
const B = {
  inkyBlue:    "#0E2044",   // primary — deep inky navy
  inkyLight:   "#1B3461",   // lighter ink for cards
  olive:       "#6E7E28",   // secondary — olive green
  oliveLight:  "#8FA832",   // lighter olive for accents
  orange:      "#C85C1E",   // tertiary — burnt orange
  orangeLight: "#E07030",
  lime:        "#95C11F",   // accent — lime green
  rubine:      "#CE0058",   // accent — rubine red (PMS standard)
  darkBlue:    "#0B1A4F",   // accent — dark blue
  white:       "#FFFFFF",
  offWhite:    "#F4F6FA",
  lightGray:   "#E8ECF2",
  midGray:     "#8A95A8",
  dark:        "#1A2235",
};

function pct(s: number) { return Math.round(s * 100); }

function scoreColor(s: number) {
  if (s >= 0.82) return B.olive;
  if (s >= 0.68) return B.orange;
  return B.rubine;
}
function scoreLabel(s: number) {
  if (s >= 0.82) return "Strong";
  if (s >= 0.68) return "Adequate";
  return "Needs Attention";
}

function renderMd(md: string): string {
  return md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^#{1,3} (.+)$/gm, (_,t) => `<h3 class="rh">${t}</h3>`)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^\|.+\|$/gm, "")
    .replace(/^---+$/gm, "<hr>")
    .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]+?<\/li>)(?=\n(?!<li>)|\n*$)/g, "<ul>$1</ul>")
    .split("\n")
    .map(l => l.startsWith("<") ? l : l.trim() ? `<p>${l}</p>` : "")
    .join("\n");
}

function stageRow(t: StageTrace, num: string, title: string, desc: string): string {
  const ok = t.status === "success";
  return `
  <div class="stage-row">
    <div class="stage-num">${num}</div>
    <div class="stage-info">
      <div class="stage-name">${title}</div>
      <div class="stage-desc">${desc}</div>
    </div>
    <div class="stage-right">
      <span class="stage-pill ${ok ? "pill-ok" : "pill-fail"}">${ok ? "✓ Complete" : "✗ Failed"}</span>
      <span class="stage-ms">${t.duration_ms}ms</span>
    </div>
  </div>`;
}

function gaugeRow(label: string, score: number): string {
  const p = pct(score);
  const c = scoreColor(score);
  return `
  <div class="gauge-row">
    <div class="g-label">${label}</div>
    <div class="g-track"><div class="g-fill" style="width:${p}%;background:${c}"></div></div>
    <div class="g-val" style="color:${c}">${p}</div>
  </div>`;
}

function artifactPanel(id: string, icon: string, title: string, body: string): string {
  return `
  <div class="panel" id="sec-${id}">
    <button class="panel-head" onclick="tog('${id}')">
      <span class="ph-icon">${icon}</span>
      <span class="ph-title">${title}</span>
      <svg class="ph-chev" id="chev-${id}" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"/>
      </svg>
    </button>
    <div class="panel-body" id="body-${id}">${body}</div>
  </div>`;
}

export async function generateReport(data: ReportData, runDir: string): Promise<void> {
  const { runId, requirements, evalResult, traces } = data;
  const ms = traces.reduce((s, t) => s + t.duration_ms, 0);
  const overall = pct(evalResult.overall_score);
  const oc = scoreColor(evalResult.overall_score);
  const ol = scoreLabel(evalResult.overall_score);
  const date = new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });

  // SVG ring math — r=40, circumference=251
  const C = 251;
  const offset = Math.round(C * (1 - evalResult.overall_score));

  const stages = [
    { num:"01", title:"Brief Intake",       desc:"Parse and structure the brand team brief into validated fields." },
    { num:"02", title:"Strategy Planning",  desc:"Build a phased engagement plan with escalation points." },
    { num:"03", title:"Delivery Package",   desc:"Operational handoff — audience, triggers, channel, format." },
    { num:"04", title:"QA & Testing",       desc:"Generate test cases — happy path, edge cases, adversarial." },
    { num:"05", title:"Compliance Review",  desc:"Flag healthcare risks — off-label, fair balance, data." },
    { num:"06", title:"Quality Evaluation", desc:"Score all outputs across five dimensions, calibrated." },
  ];

  const dims: [string, number][] = [
    ["Requirement Coverage",  evalResult.requirement_coverage],
    ["Targeting Clarity",     evalResult.targeting_clarity],
    ["QA Completeness",       evalResult.qa_completeness],
    ["Risk Detection",        evalResult.risk_detection],
    ["Documentation Quality", evalResult.documentation_quality],
  ];

  const chips = [
    ...requirements.audience.specialty,
    ...requirements.channels,
    ...requirements.audience.geography.slice(0, 3),
  ];

  const flagsHtml = evalResult.flags.length > 0
    ? evalResult.flags.map(f => `
      <div class="flag-row">
        <div class="flag-icon">!</div>
        <div class="flag-text">${f}</div>
      </div>`).join("")
    : `<p class="no-flags">No critical flags raised.</p>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Relevate Health · HCP Brief Report · ${runId}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --ink:${B.inkyBlue};--ink2:${B.inkyLight};
  --olive:${B.olive};--olive2:${B.oliveLight};
  --orange:${B.orange};--rubine:${B.rubine};--lime:${B.lime};
  --dark:${B.dark};--mid:${B.midGray};
  --light:${B.lightGray};--off:${B.offWhite};--white:${B.white};
}
body{font-family:'Inter',Helvetica,sans-serif;background:var(--off);color:var(--dark);line-height:1.6}
h1,h2,h3,.brand,.hero-title,.sec-eye,.card-label{font-family:'Nunito','Century Gothic',Futura,sans-serif}

/* ── Nav ── */
.nav{
  background:var(--ink);
  height:58px;padding:0 2rem;
  display:flex;align-items:center;gap:1rem;
  position:sticky;top:0;z-index:100;
  border-bottom:1px solid rgba(255,255,255,0.06);
}
.nav-logo{display:flex;align-items:center;gap:0.6rem}
.nav-circles{display:flex;gap:3px}
.nav-circle{
  width:10px;height:10px;border-radius:50%;
  border:2px solid rgba(255,255,255,0.6);
}
.nav-circle.fill{background:var(--olive2);border-color:var(--olive2)}
.brand{color:var(--white);font-size:0.95rem;font-weight:800;letter-spacing:-0.01em}
.nav-divider{width:1px;height:18px;background:rgba(255,255,255,0.15);margin:0 0.25rem}
.nav-context{color:rgba(255,255,255,0.45);font-size:0.75rem}
.nav-links{margin-left:auto;display:flex;gap:2px}
.nav-btn{
  background:none;border:none;cursor:pointer;
  color:rgba(255,255,255,0.55);font-size:0.75rem;font-weight:500;
  padding:0.3rem 0.7rem;border-radius:5px;transition:all 0.15s;
}
.nav-btn:hover{background:rgba(255,255,255,0.08);color:var(--white)}

/* ── Hero ── */
.hero{
  background: linear-gradient(140deg, var(--ink) 0%, #102860 55%, #0B1A40 100%);
  padding:3rem 2rem 2.5rem;
  position:relative;overflow:hidden;
}
/* decorative circles — brand motif */
.hero-deco{
  position:absolute;right:-80px;top:-80px;
  width:380px;height:380px;border-radius:50%;
  border:55px solid rgba(255,255,255,0.03);
  pointer-events:none;
}
.hero-deco2{
  position:absolute;right:60px;top:40px;
  width:200px;height:200px;border-radius:50%;
  border:30px solid rgba(110,126,40,0.12);
  pointer-events:none;
}
.hero-inner{max-width:1080px;margin:0 auto;position:relative}
.hero-eyebrow{
  font-size:0.65rem;font-weight:700;
  letter-spacing:0.16em;text-transform:uppercase;
  color:var(--orange);margin-bottom:0.75rem;
}
.hero-title{
  font-size:1.85rem;font-weight:900;
  color:var(--white);line-height:1.2;
  max-width:620px;margin-bottom:0.75rem;
  letter-spacing:-0.02em;
}
.hero-path{font-size:0.9rem;color:rgba(255,255,255,0.55);margin-bottom:1.5rem;max-width:500px}
.hero-chips{display:flex;flex-wrap:wrap;gap:0.4rem}
.chip{
  background:rgba(255,255,255,0.07);
  border:1px solid rgba(255,255,255,0.14);
  border-radius:999px;padding:0.22rem 0.8rem;
  font-size:0.72rem;color:rgba(255,255,255,0.75);font-weight:500;
}

/* ── Score band ── */
.score-band{background:var(--white);border-bottom:1px solid var(--light);box-shadow:0 1px 6px rgba(0,0,0,0.06)}
.score-inner{
  max-width:1080px;margin:0 auto;
  padding:1.75rem 2rem;
  display:grid;grid-template-columns:110px 1fr 160px;
  align-items:center;gap:2rem;
}
.ring-wrap{position:relative;width:110px;height:110px}
.ring-svg{transform:rotate(-90deg)}
.ring-bg{fill:none;stroke:var(--light);stroke-width:10}
.ring-fg{fill:none;stroke:${oc};stroke-width:10;stroke-linecap:round;stroke-dasharray:${C};stroke-dashoffset:${offset}}
.ring-inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.ring-num{font-family:'Nunito',sans-serif;font-size:1.7rem;font-weight:900;color:${oc};line-height:1}
.ring-label{font-size:0.58rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--mid);margin-top:2px}
.gauges{display:flex;flex-direction:column;gap:0.65rem}
.gauge-row{display:grid;grid-template-columns:168px 1fr 36px;align-items:center;gap:0.85rem}
.g-label{font-size:0.76rem;color:var(--mid)}
.g-track{background:var(--light);border-radius:999px;height:6px;overflow:hidden}
.g-fill{height:100%;border-radius:999px}
.g-val{font-size:0.76rem;font-weight:700;text-align:right}
.run-stats{display:flex;flex-direction:column;gap:0.6rem;border-left:1px solid var(--light);padding-left:1.75rem}
.stat-row{display:flex;flex-direction:column}
.stat-val{font-family:'Nunito',sans-serif;font-size:1.35rem;font-weight:900;color:var(--ink2);line-height:1}
.stat-lbl{font-size:0.65rem;color:var(--mid);text-transform:uppercase;letter-spacing:0.06em;margin-top:1px}
.stat-divider{height:1px;background:var(--light)}
.run-id{font-family:monospace;font-size:0.62rem;color:var(--mid);margin-top:0.25rem}

/* ── Layout ── */
.page{max-width:1080px;margin:0 auto;padding:2rem 2rem 5rem;display:grid;grid-template-columns:1fr 290px;gap:1.75rem;align-items:start}
.left{display:flex;flex-direction:column;gap:1.5rem}
.sidebar{display:flex;flex-direction:column;gap:1.25rem}

/* ── Cards ── */
.card{background:var(--white);border:1px solid var(--light);border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04)}
.card-head{
  padding:0.9rem 1.25rem;
  border-bottom:1px solid var(--light);
  display:flex;align-items:center;gap:0.75rem;
}
.card-accent{width:3px;height:16px;border-radius:2px}
.card-label{font-size:0.82rem;font-weight:800;color:var(--ink)}
.card-body{padding:1.25rem}

/* ── Audience grid ── */
.aud-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.65rem}
.aud-cell{
  background:var(--off);border-radius:8px;
  padding:0.7rem 0.9rem;
  border-left:3px solid var(--olive);
}
.aud-lbl{font-size:0.6rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--mid);margin-bottom:0.25rem}
.aud-val{font-size:0.82rem;color:var(--ink);font-weight:600;line-height:1.45}

/* ── Stage pipeline ── */
.stage-row{
  display:grid;grid-template-columns:40px 1fr auto;
  align-items:center;gap:1rem;
  padding:0.85rem 1.25rem;
  border-bottom:1px solid var(--off);
}
.stage-row:last-child{border-bottom:none}
.stage-num{
  width:34px;height:34px;border-radius:7px;
  background:var(--ink);
  color:var(--white);
  font-family:'Nunito',sans-serif;font-size:0.65rem;font-weight:900;
  display:flex;align-items:center;justify-content:center;
  letter-spacing:0.03em;flex-shrink:0;
}
.stage-name{font-size:0.84rem;font-weight:600;color:var(--ink)}
.stage-desc{font-size:0.73rem;color:var(--mid);margin-top:0.1rem;line-height:1.4}
.stage-right{display:flex;flex-direction:column;align-items:flex-end;gap:0.2rem;flex-shrink:0}
.stage-pill{font-size:0.65rem;font-weight:700;border-radius:999px;padding:0.18rem 0.65rem;white-space:nowrap}
.pill-ok{background:#E6F5D0;color:var(--olive)}
.pill-fail{background:#FCE4EE;color:var(--rubine)}
.stage-ms{font-size:0.65rem;color:var(--mid)}

/* ── Artifact panels ── */
.panel{background:var(--white);border:1px solid var(--light);border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04)}
.panel-head{
  width:100%;display:flex;align-items:center;gap:0.7rem;
  padding:0.9rem 1.25rem;border:none;background:none;
  cursor:pointer;text-align:left;transition:background 0.12s;
  border-bottom:1px solid var(--light);
}
.panel-head:hover{background:var(--off)}
.ph-icon{font-size:0.95rem}
.ph-title{font-family:'Nunito',sans-serif;font-size:0.84rem;font-weight:800;color:var(--ink);flex:1}
.ph-chev{color:var(--mid);transition:transform 0.2s;flex-shrink:0}
.ph-chev.open{transform:rotate(180deg)}
.panel-body{display:none;padding:1.5rem;border-top:1px solid var(--off)}
.panel-body.open{display:block}
.panel-body .rh{
  font-family:'Nunito',sans-serif;
  font-size:0.86rem;font-weight:800;color:var(--ink);
  margin:1.25rem 0 0.45rem;
  padding-left:0.65rem;
  border-left:3px solid var(--olive);
}
.panel-body p{font-size:0.82rem;color:#374151;line-height:1.75;margin-bottom:0.45rem}
.panel-body ul{padding-left:1.25rem;margin-bottom:0.75rem}
.panel-body li{font-size:0.82rem;color:#374151;line-height:1.75}
.panel-body strong{color:var(--ink)}
.panel-body code{background:var(--off);border:1px solid var(--light);padding:0.1rem 0.3rem;border-radius:4px;font-size:0.75rem}
.panel-body hr{border:none;border-top:1px solid var(--light);margin:1rem 0}

/* ── Sidebar ── */
/* Recommended path — gradient card */
.path-card{
  background:linear-gradient(135deg, var(--ink) 0%, #102860 100%);
  border-radius:12px;padding:1.1rem 1.25rem;
  box-shadow:0 3px 10px rgba(14,32,68,0.22);
  position:relative;overflow:hidden;
}
.path-card::after{
  content:'';position:absolute;right:-30px;bottom:-30px;
  width:110px;height:110px;border-radius:50%;
  border:20px solid rgba(110,126,40,0.18);
}
.path-eye{font-size:0.6rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--orange);margin-bottom:0.4rem}
.path-txt{font-family:'Nunito',sans-serif;font-size:0.9rem;font-weight:800;color:var(--white);line-height:1.45;position:relative}

/* Flags card */
.flags-card{background:var(--white);border:1px solid var(--light);border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04)}
.flags-head{
  background:var(--orange);
  padding:0.6rem 1rem;
  font-family:'Nunito',sans-serif;font-size:0.75rem;font-weight:800;
  color:var(--white);display:flex;align-items:center;gap:0.4rem;
}
.flags-body{padding:0.75rem 1rem;display:flex;flex-direction:column;gap:0.6rem}
.flag-row{display:flex;align-items:flex-start;gap:0.65rem}
.flag-icon{
  width:18px;height:18px;border-radius:50%;
  background:var(--orange);color:var(--white);
  font-size:0.65rem;font-weight:800;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;margin-top:1px;
}
.flag-text{font-size:0.76rem;color:var(--dark);line-height:1.55}
.no-flags{font-size:0.8rem;color:var(--olive);padding:0.25rem 0}

/* Notes */
.notes-card{background:var(--white);border:1px solid var(--light);border-radius:12px;padding:1rem 1.1rem;box-shadow:0 1px 4px rgba(0,0,0,0.04)}
.notes-eye{font-size:0.6rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--mid);margin-bottom:0.4rem}
.notes-txt{font-size:0.79rem;color:var(--dark);line-height:1.7}

/* List cards */
.list-card{background:var(--white);border:1px solid var(--light);border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04)}
.list-head{padding:0.65rem 1rem;border-bottom:1px solid var(--light);font-family:'Nunito',sans-serif;font-size:0.8rem;font-weight:800;color:var(--ink)}
.list-body{padding:0.75rem 1rem;display:flex;flex-direction:column;gap:0.35rem}
.list-item{font-size:0.76rem;color:var(--dark);line-height:1.55;padding-left:0.8rem;position:relative}
.list-item::before{content:'—';position:absolute;left:0;color:var(--olive2);font-weight:700}

/* ── Footer ── */
.footer{
  background:var(--ink);
  background:linear-gradient(135deg, var(--ink) 0%, var(--darkBlue) 100%);
  padding:1.5rem 2rem;
  display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;
}
.footer-brand{font-family:'Nunito',sans-serif;font-size:0.88rem;font-weight:800;color:var(--white);display:flex;align-items:center;gap:0.5rem}
.footer-dot{width:7px;height:7px;border-radius:50%;background:var(--orange)}
.footer-disc{font-size:0.68rem;color:rgba(255,255,255,0.35);max-width:520px;line-height:1.55}

@media(max-width:780px){
  .page{grid-template-columns:1fr}
  .score-inner{grid-template-columns:1fr;gap:1rem}
  .gauge-row{grid-template-columns:120px 1fr 32px}
}
</style>
</head>
<body>

<!-- Nav -->
<nav class="nav">
  <div class="nav-logo">
    <div class="nav-circles">
      <div class="nav-circle fill"></div>
      <div class="nav-circle"></div>
      <div class="nav-circle"></div>
    </div>
    <span class="brand">Relevate Health</span>
  </div>
  <div class="nav-divider"></div>
  <span class="nav-context">HCP Brief Workflow · ${date}</span>
  <div class="nav-links">
    <button class="nav-btn" onclick="open_('plan')">Plan</button>
    <button class="nav-btn" onclick="open_('delivery')">Delivery</button>
    <button class="nav-btn" onclick="open_('qa')">QA</button>
    <button class="nav-btn" onclick="open_('compliance')">Compliance</button>
  </div>
</nav>

<!-- Hero -->
<div class="hero">
  <div class="hero-deco"></div>
  <div class="hero-deco2"></div>
  <div class="hero-inner">
    <div class="hero-eyebrow">HCP Engagement Brief — Workflow Output</div>
    <div class="hero-title">${requirements.objective.length > 115 ? requirements.objective.slice(0,115)+"…" : requirements.objective}</div>
    <div class="hero-path">${requirements.recommended_path || "EHR point-of-care + on-demand CME · KOL-weighted targeting"}</div>
    <div class="hero-chips">
      ${chips.map(c=>`<span class="chip">${c}</span>`).join("")}
    </div>
  </div>
</div>

<!-- Score band -->
<div class="score-band">
  <div class="score-inner">
    <div class="ring-wrap">
      <svg class="ring-svg" width="110" height="110" viewBox="0 0 110 110">
        <circle class="ring-bg" cx="55" cy="55" r="40"/>
        <circle class="ring-fg" cx="55" cy="55" r="40"/>
      </svg>
      <div class="ring-inner">
        <span class="ring-num">${overall}</span>
        <span class="ring-label">${ol}</span>
      </div>
    </div>
    <div class="gauges">
      ${dims.map(([l,s])=>gaugeRow(l,s)).join("")}
    </div>
    <div class="run-stats">
      <div class="stat-row">
        <span class="stat-val">${traces.length}</span>
        <span class="stat-lbl">Stages</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-row">
        <span class="stat-val">${(ms/1000).toFixed(1)}s</span>
        <span class="stat-lbl">Runtime</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-row">
        <span class="stat-val" style="color:${evalResult.flags.length>0?B.orange:B.olive}">${evalResult.flags.length}</span>
        <span class="stat-lbl">Flag${evalResult.flags.length!==1?"s":""}</span>
      </div>
      <div class="run-id">${runId}</div>
    </div>
  </div>
</div>

<!-- Main -->
<div class="page">
  <div class="left">

    <!-- Audience -->
    <div class="card">
      <div class="card-head">
        <div class="card-accent" style="background:var(--olive)"></div>
        <div class="card-label">Target Audience</div>
      </div>
      <div class="card-body">
        <div class="aud-grid">
          <div class="aud-cell"><div class="aud-lbl">Specialty</div><div class="aud-val">${requirements.audience.specialty.join(", ")||"—"}</div></div>
          <div class="aud-cell"><div class="aud-lbl">Geography</div><div class="aud-val">${requirements.audience.geography.join(", ")||"—"}</div></div>
          <div class="aud-cell"><div class="aud-lbl">Care Setting</div><div class="aud-val">${requirements.audience.care_setting.join(", ")||"—"}</div></div>
          <div class="aud-cell"><div class="aud-lbl">Channels</div><div class="aud-val">${requirements.channels.join(", ")||"—"}</div></div>
        </div>
      </div>
    </div>

    <!-- Pipeline -->
    <div class="card">
      <div class="card-head">
        <div class="card-accent" style="background:var(--ink2)"></div>
        <div class="card-label">Workflow Pipeline</div>
      </div>
      ${traces.map((t,i)=>stageRow(t, stages[i]?.num??String(i+1).padStart(2,"0"), stages[i]?.title??t.stage, stages[i]?.desc??t.output_summary)).join("")}
    </div>

    ${artifactPanel("plan",       "🗺️", "Execution Plan",     renderMd(data.plan))}
    ${artifactPanel("delivery",   "📦", "Delivery Package",   renderMd(data.deliveryPackage))}
    ${artifactPanel("qa",         "🧪", "QA Test Plan",       renderMd(data.testPlan))}
    ${artifactPanel("compliance", "🛡️", "Compliance Review",  renderMd(data.riskReview))}

  </div>

  <div class="sidebar">

    <div class="path-card">
      <div class="path-eye">Recommended Path</div>
      <div class="path-txt">${requirements.recommended_path || "EHR point-of-care · KOL-weighted · CME on-demand secondary"}</div>
    </div>

    <div class="flags-card">
      <div class="flags-head">⚠ Flags for Human Review</div>
      <div class="flags-body">${flagsHtml}</div>
    </div>

    <div class="notes-card">
      <div class="notes-eye">Evaluator Notes</div>
      <div class="notes-txt">${evalResult.overall_notes}</div>
    </div>

    ${requirements.open_questions.length>0?`
    <div class="list-card">
      <div class="list-head">❓ Open Questions</div>
      <div class="list-body">${requirements.open_questions.map(q=>`<div class="list-item">${q}</div>`).join("")}</div>
    </div>`:""}

    ${requirements.risks.length>0?`
    <div class="list-card">
      <div class="list-head">⚠️ Known Risks</div>
      <div class="list-body">${requirements.risks.map(r=>`<div class="list-item">${r}</div>`).join("")}</div>
    </div>`:""}

  </div>
</div>

<footer class="footer">
  <div class="footer-brand"><div class="footer-dot"></div>Relevate Health</div>
  <div class="footer-disc">Fictional prototype for interview demonstration · All data illustrative and sanitized · Not for operational use · Not legal or regulatory advice</div>
</footer>

<script>
function tog(id){
  const b=document.getElementById('body-'+id);
  const c=document.getElementById('chev-'+id);
  const open=b.classList.toggle('open');
  c.classList.toggle('open',open);
}
function open_(id){
  const el=document.getElementById('sec-'+id);
  if(!el)return;
  el.scrollIntoView({behavior:'smooth',block:'start'});
  const b=document.getElementById('body-'+id);
  const c=document.getElementById('chev-'+id);
  if(b&&!b.classList.contains('open')){b.classList.add('open');c&&c.classList.add('open')}
}
</script>
</body>
</html>`;

  await writeFile(path.join(runDir, "report.html"), html);
}
