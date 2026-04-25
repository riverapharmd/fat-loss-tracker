import { useState, useEffect, useRef } from "react";

const FONT_URL = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap";

// ── Meal data ─────────────────────────────────────────────────────────────────

const MEAL_MACROS = [
  { // MON
    breakfast: { label: "2 eggs · 4 egg whites · pork sausage · salsa",            P:40, C:4,  F:20, Cal:352 },
    lunch:     { label: "Chicken taco bowl · lettuce · salsa · avocado (2 tbsp)",  P:38, C:18, F:10, Cal:314 },
    snack:     { label: "String cheese + deli chicken slices",                      P:18, C:2,  F:7,  Cal:143 },
    dinner:    { label: "Salmon · asparagus · small potato",                        P:38, C:33, F:12, Cal:392 },
  },
  { // TUE
    breakfast: { label: "Breakfast wrap — eggs + spinach + chicken sausage",        P:35, C:22, F:15, Cal:359 },
    lunch:     { label: "Beef burger bowl",                                         P:40, C:10, F:18, Cal:362 },
    snack:     { label: "Hard boiled eggs (×2)",                                    P:12, C:1,  F:10, Cal:142 },
    dinner:    { label: "Chicken stir fry + ½ cup rice",                            P:40, C:30, F:8,  Cal:352 },
  },
  { // WED
    breakfast: { label: "Steak + eggs",                                             P:44, C:2,  F:22, Cal:374 },
    lunch:     { label: "Rotisserie chicken salad",                                 P:35, C:8,  F:10, Cal:258 },
    snack:     { label: "Cottage cheese savory bowl",                               P:20, C:6,  F:4,  Cal:136 },
    dinner:    { label: "Taco bowl (beef)",                                         P:35, C:25, F:12, Cal:344 },
  },
  { // THU
    breakfast: { label: "Ground beef scramble",                                     P:36, C:5,  F:18, Cal:322 },
    lunch:     { label: "Tuna lettuce wraps",                                       P:30, C:5,  F:5,  Cal:185 },
    snack:     { label: "Deli chicken roll-ups",                                    P:18, C:2,  F:3,  Cal:106 },
    dinner:    { label: "Pork loin · broccoli",                                     P:42, C:10, F:8,  Cal:280 },
  },
  { // FRI
    breakfast: { label: "Eggs + cottage cheese",                                    P:35, C:8,  F:14, Cal:294 },
    lunch:     { label: "Chicken bowl",                                             P:40, C:25, F:8,  Cal:328 },
    snack:     { label: "String cheese",                                            P:6,  C:1,  F:5,  Cal:73  },
    dinner:    { label: "Steak · green beans",                                      P:46, C:10, F:15, Cal:355 },
  },
  { // SAT
    breakfast: { label: "Eggs + bacon or pork sausage",                             P:34, C:2,  F:22, Cal:346 },
    lunch:     { label: "Beef burger salad bowl",                                   P:38, C:8,  F:16, Cal:322 },
    snack:     null,
    dinner:    { label: "Flexible — protein focused",                               P:38, C:15, F:12, Cal:314 },
  },
  { // SUN
    breakfast: { label: "Leftover steak + eggs",                                    P:44, C:2,  F:22, Cal:374 },
    lunch:     { label: "Chicken salad",                                            P:35, C:8,  F:10, Cal:258 },
    snack:     null,
    dinner:    { label: "Roast chicken + veg",                                      P:42, C:15, F:10, Cal:314 },
  },
];

const DOWS     = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
const WORKOUTS = [
  "Matt Wilpers 30-min Power Zone + 10-min glute bridges / BW squats",
  "Upper body: row · shoulder press · pulldown · curls + 20-min low-impact ride",
  "Robin Arzón 30-min HIIT + 10-min core",
  "Lower body: goblet squat · RDL · step-ups · hip thrust",
  "Cody Rigsby 30-min Pop Ride + 10-min arms",
  "Jess Sims 45-min Bootcamp",
  "Stretch / mobility / meal prep",
];
const WALKS = ["45-min brisk","45-min brisk","45-min brisk","45-min brisk","45-min brisk","60-min outdoor","60-min easy"];

const ALL_DAYS = Array.from({ length: 30 }, (_, i) => {
  const dow  = i % 7;
  const week = Math.floor(i / 7) + 1;
  const prog = week === 1 ? "" : week === 2 ? " ↑ heavier" : week === 3 ? " ↑↑ harder" : " ↑↑↑ max effort";
  return { day: i+1, dow: DOWS[dow], dowIndex: dow, workout: WORKOUTS[dow]+prog, walk: WALKS[dow], macros: MEAL_MACROS[dow] };
});

const MEAL_IDS    = ["breakfast","lunch","snack","dinner"];
const MEAL_TIMES  = { breakfast:"7:45 AM", lunch:"11:45 AM", snack:"3:00 PM", dinner:"6:00 PM" };
const MEAL_LABELS = { breakfast:"Breakfast", lunch:"Lunch", snack:"Snack", dinner:"Dinner" };
const PORTIONS    = [0.5, 0.75, 1.0];
const PORTION_LABELS = { 0.5:"½", 0.75:"¾", 1.0:"Full" };

const BINARY_GOALS = [
  { id:"walk_am", emoji:"🌅", label:"AM Walk"  },
  { id:"steps",   emoji:"👟", label:"10k Steps" },
  { id:"workout", emoji:"💪", label:"Workout"  },
  { id:"kitchen", emoji:"🚫", label:"Kitchen"  },
];

const WATER = [
  { id:"w1", oz:24,  label:"24 oz",  by:"8 AM"  },
  { id:"w2", oz:48,  label:"48 oz",  by:"11 AM" },
  { id:"w3", oz:72,  label:"72 oz",  by:"2 PM"  },
  { id:"w4", oz:96,  label:"96 oz",  by:"5 PM"  },
  { id:"w5", oz:128, label:"128 oz", by:"8 PM"  },
];

const PROTEIN_GOAL = 140;
const WATER_GOAL   = 128;
const NON_NEG_IDS  = ["weigh", ...BINARY_GOALS.map(g => g.id)];
const WATER_IDS    = WATER.map(w => w.id);
const ALL_CHECK_IDS = [...NON_NEG_IDS, ...MEAL_IDS, ...WATER_IDS];

// ── Keys & defaults ───────────────────────────────────────────────────────────

const cKey = (d, id)   => `d${d}_${id}`;
const pKey = (d, meal) => `p${d}_${meal}`;

function defaultChecks()  { const s={}; for(let d=1;d<=30;d++) for(const id of ALL_CHECK_IDS) s[cKey(d,id)]=false; return s; }
function defaultPortions(){ const s={}; for(let d=1;d<=30;d++) for(const m of MEAL_IDS) s[pKey(d,m)]=1.0; return s; }
function defaultOther()   { const s={}; for(let d=1;d<=30;d++) s[d]=[]; return s; }
function defaultWeights() { const s={}; for(let d=1;d<=30;d++) s[d]=""; return s; }

// ── localStorage helpers ──────────────────────────────────────────────────────

function lsGet(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch { return fallback; }
}

function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ── Macro calculations ────────────────────────────────────────────────────────

function calcCheckedMacros(dayData, checks, portions, other) {
  let P=0, C=0, F=0, Cal=0;
  for (const m of MEAL_IDS) {
    if (!checks[cKey(dayData.day, m)]) continue;
    const base = dayData.macros[m]; if (!base) continue;
    const por = portions[pKey(dayData.day, m)] ?? 1.0;
    P+=base.P*por; C+=base.C*por; F+=base.F*por; Cal+=base.Cal*por;
  }
  for (const e of (other[dayData.day]||[])) { P+=e.P; C+=e.C; F+=e.F; Cal+=e.Cal; }
  return { P:Math.round(P), C:Math.round(C), F:Math.round(F), Cal:Math.round(Cal) };
}

function getWaterOz(dayNum, checks) {
  const checked = WATER.filter(w => checks[cKey(dayNum, w.id)]);
  return checked.length > 0 ? Math.max(...checked.map(w => w.oz)) : 0;
}

function completionPct(dayNum, checks) {
  return Math.round(ALL_CHECK_IDS.filter(id => checks[cKey(dayNum,id)]).length / ALL_CHECK_IDS.length * 100);
}

// ── AI estimation ─────────────────────────────────────────────────────────────

async function estimateMacros(description) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: `You are a nutrition expert. Estimate macros for any food described in plain language.
Return ONLY valid JSON, no markdown, no backticks:
{"P": <protein grams integer>, "C": <carb grams integer>, "F": <fat grams integer>, "Cal": <calories integer>, "summary": "<clean 8-word-max description>"}
Use realistic portions, account for cooking methods. Alcohol: wine ~120cal/5oz, beer ~150cal/12oz, spirits ~100cal/1.5oz.`,
      messages: [{ role:"user", content: description }]
    })
  });
  if (!res.ok) throw new Error("API error");
  const data = await res.json();
  const text = data.content.find(b => b.type==="text")?.text || "";
  return JSON.parse(text.replace(/```json|```/g,"").trim());
}

// ── CSS ───────────────────────────────────────────────────────────────────────

const css = `
  @import url('${FONT_URL}');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --bg:#F6F2EB; --bg2:#EDEAE2; --surface:#FDFBF8;
    --forest:#1B3A2E; --forest-lt:#2A5441;
    --coral:#C94F38; --gold:#B8903A; --blue:#4A8FB5;
    --purple:#7B5EA7;
    --ink:#1E1E1E; --muted:#7A7060; --border:#D8D2C6;
  }
  body { background:var(--bg); font-family:'DM Sans',sans-serif; color:var(--ink); min-height:100vh; }
  .app { max-width:960px; margin:0 auto; padding:0 16px 60px; }

  .header { background:var(--forest); color:#fff; padding:32px 24px 24px; margin:0 -16px 28px; position:relative; overflow:hidden; }
  .header::before { content:''; position:absolute; right:-40px; top:-40px; width:220px; height:220px; border-radius:50%; background:rgba(255,255,255,0.04); }
  .header::after  { content:''; position:absolute; right:40px; bottom:-60px; width:150px; height:150px; border-radius:50%; background:rgba(200,144,58,0.15); }
  .h-inner { position:relative; z-index:1; }
  .h-eye  { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:3px; color:rgba(255,255,255,0.5); margin-bottom:6px; }
  .h-name { font-family:'Playfair Display',serif; font-size:clamp(28px,6vw,44px); font-weight:900; line-height:1; margin-bottom:4px; }
  .h-sub  { font-size:13px; color:rgba(255,255,255,0.55); margin-bottom:18px; }
  .pillars { display:flex; flex-wrap:wrap; gap:6px; }
  .pillar { background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); border-radius:4px; padding:4px 10px; font-family:'DM Mono',monospace; font-size:10px; letter-spacing:1px; color:rgba(255,255,255,0.8); }

  .overall-bar { background:var(--surface); border:1px solid var(--border); border-radius:10px; padding:13px 18px; margin-bottom:22px; display:flex; align-items:center; gap:14px; }
  .bar-label { font-family:'DM Mono',monospace; font-size:11px; letter-spacing:1px; color:var(--muted); white-space:nowrap; }
  .bar-track { flex:1; height:6px; background:var(--bg2); border-radius:99px; overflow:hidden; }
  .bar-fill  { height:100%; border-radius:99px; transition:width 0.5s ease; }
  .bar-fill.green { background:var(--forest); }
  .bar-num { font-family:'DM Mono',monospace; font-size:13px; font-weight:500; color:var(--forest); min-width:36px; text-align:right; }

  .week-tabs { display:flex; gap:4px; margin-bottom:18px; }
  .week-tab { flex:1; padding:10px 4px; border:1.5px solid var(--border); border-radius:8px; background:var(--surface); font-family:'DM Mono',monospace; font-size:11px; letter-spacing:1px; color:var(--muted); cursor:pointer; transition:all 0.15s; text-align:center; }
  .week-tab:hover { border-color:var(--forest); color:var(--forest); }
  .week-tab.active { background:var(--forest); border-color:var(--forest); color:white; }
  .week-tab-pct { display:block; font-size:14px; font-weight:500; margin-top:2px; }

  .day-grid { display:flex; flex-direction:column; gap:10px; }
  .day-card { background:var(--surface); border:1.5px solid var(--border); border-radius:12px; overflow:hidden; transition:box-shadow 0.2s; }
  .day-card:hover { box-shadow:0 4px 20px rgba(0,0,0,0.07); }
  .day-card.open { border-color:var(--forest); }

  .day-header { display:flex; align-items:center; gap:12px; padding:13px 16px; cursor:pointer; user-select:none; }
  .day-badge { width:44px; height:44px; border-radius:8px; background:var(--forest); display:flex; flex-direction:column; align-items:center; justify-content:center; flex-shrink:0; }
  .badge-dow { font-family:'DM Mono',monospace; font-size:8px; letter-spacing:1.5px; color:rgba(255,255,255,0.6); }
  .badge-num { font-family:'Playfair Display',serif; font-size:18px; font-weight:900; color:#fff; line-height:1.1; }
  .day-hinfo { flex:1; min-width:0; }
  .day-htitle { font-size:12px; font-weight:500; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .day-hprev  { font-family:'DM Mono',monospace; font-size:10px; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .day-hright { display:flex; align-items:center; gap:8px; flex-shrink:0; }
  .pct-txt { font-family:'DM Mono',monospace; font-size:11px; color:var(--muted); }
  .pct-txt.done { color:var(--forest-lt); font-weight:500; }
  .mini-ring { width:26px; height:26px; }
  .chevron { font-size:11px; color:var(--muted); transition:transform 0.2s; }
  .chevron.open { transform:rotate(180deg); }

  .day-body { border-top:1px solid var(--border); }

  @keyframes spin { to{ transform:rotate(360deg) } }
  @keyframes slideDown { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:translateY(0)} }

  /* Goals section */
  .goals-section { background:linear-gradient(135deg,#1B3A2E 0%,#243D30 100%); padding:16px 18px 18px; animation:slideDown 0.18s ease; }
  .goals-title { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:3px; text-transform:uppercase; color:rgba(255,255,255,0.4); margin-bottom:12px; }
  .goal-chips { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:14px; }
  .goal-chip { display:flex; align-items:center; gap:5px; padding:6px 10px; border-radius:99px; border:1.5px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.07); cursor:pointer; transition:all 0.2s; user-select:none; }
  .goal-chip:hover { background:rgba(255,255,255,0.14); }
  .goal-chip.met { background:rgba(76,175,80,0.25); border-color:rgba(76,175,80,0.5); }
  .chip-emoji { font-size:13px; }
  .chip-label { font-family:'DM Mono',monospace; font-size:10px; color:rgba(255,255,255,0.75); letter-spacing:0.5px; }
  .goal-chip.met .chip-label { color:#A5D6A7; }
  .chip-check { font-size:10px; color:#A5D6A7; font-weight:700; margin-left:2px; }
  .weight-chip { cursor:default; }
  .weight-chip:hover { background:rgba(255,255,255,0.07); }
  .weight-input { width:56px; background:rgba(255,255,255,0.12); border:none; border-radius:4px; padding:2px 6px; font-family:'DM Mono',monospace; font-size:12px; color:#fff; outline:none; text-align:center; }
  .weight-input::placeholder { color:rgba(255,255,255,0.35); font-size:10px; }
  .weight-input::-webkit-inner-spin-button, .weight-input::-webkit-outer-spin-button { -webkit-appearance:none; }
  .weight-lbs { font-family:'DM Mono',monospace; font-size:10px; color:rgba(255,255,255,0.5); }
  .log-wt-btn { font-family:'DM Mono',monospace; font-size:9px; padding:2px 7px; border-radius:4px; border:1px solid rgba(255,255,255,0.25); background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.7); cursor:pointer; transition:all 0.15s; }
  .log-wt-btn:hover { background:rgba(255,255,255,0.2); }
  .goal-bars { display:flex; flex-direction:column; gap:10px; }
  .goal-bar-info { display:flex; justify-content:space-between; margin-bottom:5px; }
  .goal-bar-lbl { font-family:'DM Mono',monospace; font-size:10px; color:rgba(255,255,255,0.6); }
  .goal-bar-val { font-family:'DM Mono',monospace; font-size:11px; color:rgba(255,255,255,0.9); font-weight:500; }
  .goal-bar-val.met { color:#A5D6A7; }
  .goal-bar-track { height:8px; background:rgba(255,255,255,0.1); border-radius:99px; overflow:hidden; }
  .goal-bar-fill { height:100%; border-radius:99px; transition:width 0.5s ease; }
  .goal-bar-fill.protein { background:linear-gradient(90deg,#E57373,#EF5350); }
  .goal-bar-fill.protein.met { background:linear-gradient(90deg,#66BB6A,#43A047); }
  .goal-bar-fill.water { background:linear-gradient(90deg,#4A8FB5,#29B6F6); }
  .goal-bar-fill.water.met { background:linear-gradient(90deg,#29B6F6,#0288D1); }

  /* Day inner */
  .day-inner { padding:16px 18px 18px; animation:slideDown 0.18s ease; }
  .macro-strip { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:8px; }
  .mc { background:var(--bg2); border-radius:8px; padding:8px 6px; text-align:center; }
  .mc.prot { background:#FDF0ED; }
  .mc-val { font-family:'DM Mono',monospace; font-size:15px; font-weight:500; }
  .mc.prot .mc-val { color:var(--coral); }
  .mc-lbl { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:1.5px; color:var(--muted); margin-top:2px; }
  .macro-note { font-size:10px; color:var(--muted); font-style:italic; margin-bottom:14px; }

  .sec-title { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:2px; text-transform:uppercase; color:var(--gold); margin-bottom:8px; padding-bottom:5px; border-bottom:1px solid var(--bg2); }
  .water-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:5px; margin-bottom:16px; }
  .water-cell { display:flex; flex-direction:column; align-items:center; gap:3px; cursor:pointer; padding:6px 2px; border-radius:6px; border:1.5px solid var(--border); background:#fff; transition:all 0.15s; }
  .water-cell:hover { border-color:var(--blue); }
  .water-cell.on { background:#EBF5FB; border-color:var(--blue); }
  .w-icon { font-size:13px; }
  .w-oz { font-family:'DM Mono',monospace; font-size:9px; font-weight:500; }
  .w-by { font-family:'DM Mono',monospace; font-size:8px; color:var(--muted); }

  .day-cols { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  @media(max-width:580px){ .day-cols{grid-template-columns:1fr} }

  .meal-card { border:1.5px solid var(--border); border-radius:8px; margin-bottom:8px; overflow:hidden; background:#fff; transition:border-color 0.15s, opacity 0.15s; }
  .meal-card.eaten { border-color:#C8E6C9; background:#FAFFF9; }
  .meal-card.not-eaten { opacity:0.7; }
  .meal-top { display:flex; align-items:flex-start; gap:8px; padding:9px 10px 5px; cursor:pointer; }
  .mcbox { width:15px; height:15px; border:1.5px solid var(--border); border-radius:4px; flex-shrink:0; margin-top:2px; display:flex; align-items:center; justify-content:center; transition:all 0.15s; background:#fff; }
  .mcbox.on { background:var(--forest-lt); border-color:var(--forest-lt); }
  .ctick { color:#fff; font-size:9px; font-weight:700; }
  .meal-info { flex:1; min-width:0; }
  .meal-time { font-family:'DM Mono',monospace; font-size:9px; color:var(--coral); margin-bottom:1px; }
  .meal-name { font-size:12px; font-weight:500; margin-bottom:2px; }
  .meal-name.on { text-decoration:line-through; color:var(--muted); }
  .meal-desc { font-size:11px; color:var(--muted); line-height:1.4; }
  .meal-macros { display:flex; flex-wrap:wrap; gap:5px; padding:4px 10px 7px; }
  .mbadge { font-family:'DM Mono',monospace; font-size:9px; padding:2px 5px; border-radius:4px; background:var(--bg2); color:var(--muted); }
  .mbadge.p { background:#FDF0ED; color:var(--coral); font-weight:500; }
  .mbadge.faded { opacity:0.5; }
  .portion-row { display:flex; align-items:center; gap:6px; padding:0 10px 9px; }
  .por-lbl { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:1px; color:var(--muted); }
  .por-btns { display:flex; gap:3px; }
  .por-btn { font-family:'DM Mono',monospace; font-size:10px; padding:3px 7px; border-radius:4px; border:1.5px solid var(--border); background:#fff; color:var(--muted); cursor:pointer; transition:all 0.15s; }
  .por-btn:hover { border-color:var(--forest); color:var(--forest); }
  .por-btn.on { background:var(--forest); border-color:var(--forest); color:#fff; }

  .food-logger { border:1.5px solid #E8D8F5; border-radius:10px; background:#FAF6FF; padding:14px; margin-top:16px; }
  .food-logger-title { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:2px; text-transform:uppercase; color:var(--purple); margin-bottom:10px; padding-bottom:6px; border-bottom:1px solid #E8D8F5; display:flex; align-items:center; gap:6px; }
  .food-input-row { display:flex; gap:8px; align-items:flex-end; }
  .food-input { flex:1; border:1.5px solid var(--border); border-radius:8px; padding:9px 12px; font-family:'DM Sans',sans-serif; font-size:13px; color:var(--ink); background:#fff; resize:none; line-height:1.4; outline:none; transition:border-color 0.15s; }
  .food-input:focus { border-color:var(--purple); }
  .food-input::placeholder { color:var(--muted); font-size:12px; }
  .log-btn { padding:9px 14px; background:var(--purple); color:#fff; border:none; border-radius:8px; font-family:'DM Mono',monospace; font-size:11px; cursor:pointer; transition:opacity 0.15s; white-space:nowrap; flex-shrink:0; }
  .log-btn:hover { opacity:0.85; }
  .log-btn:disabled { opacity:0.45; cursor:not-allowed; }
  .log-thinking { display:flex; align-items:center; gap:8px; margin-top:10px; font-size:12px; color:var(--purple); font-style:italic; }
  .spinner { width:14px; height:14px; border:2px solid #E8D8F5; border-top-color:var(--purple); border-radius:50%; animation:spin 0.7s linear infinite; flex-shrink:0; }
  .log-error { margin-top:8px; font-size:11px; color:var(--coral); padding:6px 10px; background:#FFF0EE; border-radius:6px; border:1px solid #F5C6BF; }
  .logged-items { margin-top:10px; display:flex; flex-direction:column; gap:6px; }
  .logged-item { display:flex; align-items:center; gap:8px; background:#fff; border:1px solid #E8D8F5; border-radius:7px; padding:7px 10px; }
  .logged-icon { font-size:14px; flex-shrink:0; }
  .logged-info { flex:1; min-width:0; }
  .logged-desc { font-size:12px; font-weight:500; margin-bottom:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .logged-macros { display:flex; flex-wrap:wrap; gap:4px; }
  .lmbadge { font-family:'DM Mono',monospace; font-size:9px; padding:1px 5px; border-radius:3px; background:var(--bg2); color:var(--muted); }
  .lmbadge.p { background:#FDF0ED; color:var(--coral); font-weight:500; }
  .lmbadge.warn { background:#FFF3CD; color:var(--gold); }
  .del-btn { background:none; border:none; color:var(--muted); cursor:pointer; font-size:14px; flex-shrink:0; padding:2px 4px; border-radius:4px; transition:all 0.15s; line-height:1; }
  .del-btn:hover { background:#FFF0EE; color:var(--coral); }
  .log-hint { margin-top:8px; font-size:11px; color:var(--muted); font-style:italic; }

  .skip-note { margin-top:14px; padding:9px 12px; background:#FFF8F0; border:1px solid #F0D9C4; border-radius:8px; font-size:11px; color:#8A5A30; line-height:1.5; }
  .skip-note strong { color:var(--coral); }
  .reset-btn { display:block; margin:32px auto 0; padding:10px 24px; background:transparent; border:1.5px solid var(--border); border-radius:8px; font-family:'DM Mono',monospace; font-size:11px; letter-spacing:1px; color:var(--muted); cursor:pointer; transition:all 0.2s; }
  .reset-btn:hover { border-color:var(--coral); color:var(--coral); }
`;

// ── Components ────────────────────────────────────────────────────────────────

function MiniRing({ pct }) {
  const r = 10, circ = 2 * Math.PI * r;
  const color = pct === 100 ? "#2A5441" : pct >= 50 ? "#B8903A" : "#D8D2C6";
  return (
    <svg className="mini-ring" viewBox="0 0 26 26">
      <circle cx="13" cy="13" r={r} fill="none" stroke="#EDEAE2" strokeWidth="3"/>
      <circle cx="13" cy="13" r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 13 13)" style={{transition:"stroke-dasharray 0.3s"}}/>
    </svg>
  );
}

function GoalsSection({ dayData, checks, portions, other, weights, onToggle, onWeightChange }) {
  const d = dayData.day;
  let protein = 0;
  for (const m of MEAL_IDS) {
    if (!checks[cKey(d,m)]) continue;
    const base = dayData.macros[m]; if (!base) continue;
    protein += base.P * (portions[pKey(d,m)] ?? 1.0);
  }
  for (const e of (other[d]||[])) protein += e.P;
  protein = Math.round(protein);

  const waterOz    = getWaterOz(d, checks);
  const proteinPct = Math.min(100, (protein / PROTEIN_GOAL) * 100);
  const waterPct   = Math.min(100, (waterOz  / WATER_GOAL)  * 100);
  const proteinMet = protein >= PROTEIN_GOAL;
  const waterMet   = waterOz  >= WATER_GOAL;
  const weight     = weights[d] || "";
  const weighDone  = checks[cKey(d,"weigh")] || false;

  return (
    <div className="goals-section">
      <div className="goals-title">Today's Goals</div>
      <div className="goal-chips">
        <div className={`goal-chip weight-chip ${weighDone && weight ? "met" : ""}`}>
          <span className="chip-emoji">⚖️</span>
          <input className="weight-input" type="number" step="0.1" placeholder="lbs"
            value={weight}
            onChange={e => onWeightChange(d, e.target.value)}
            onClick={e => e.stopPropagation()}/>
          <span className="weight-lbs">lbs</span>
          {!weighDone
            ? <button className="log-wt-btn" onClick={e => { e.stopPropagation(); onToggle(d,"weigh"); }}>Log</button>
            : <span className="chip-check">✓</span>}
        </div>
        {BINARY_GOALS.map(g => {
          const done = checks[cKey(d,g.id)] || false;
          return (
            <div key={g.id} className={`goal-chip ${done?"met":""}`} onClick={() => onToggle(d,g.id)}>
              <span className="chip-emoji">{g.emoji}</span>
              <span className="chip-label">{g.label}</span>
              {done && <span className="chip-check">✓</span>}
            </div>
          );
        })}
      </div>
      <div className="goal-bars">
        <div>
          <div className="goal-bar-info">
            <span className="goal-bar-lbl">🥩 Protein</span>
            <span className={`goal-bar-val ${proteinMet?"met":""}`}>{protein} / {PROTEIN_GOAL}g{proteinMet?" ✓":""}</span>
          </div>
          <div className="goal-bar-track">
            <div className={`goal-bar-fill protein ${proteinMet?"met":""}`} style={{width:`${proteinPct}%`}}/>
          </div>
        </div>
        <div>
          <div className="goal-bar-info">
            <span className="goal-bar-lbl">💧 Water</span>
            <span className={`goal-bar-val ${waterMet?"met":""}`}>{waterOz} / {WATER_GOAL} oz{waterMet?" ✓":""}</span>
          </div>
          <div className="goal-bar-track">
            <div className={`goal-bar-fill water ${waterMet?"met":""}`} style={{width:`${waterPct}%`}}/>
          </div>
        </div>
      </div>
    </div>
  );
}

function MealCard({ mealId, dayData, checks, portions, onToggle, onPortion }) {
  const base  = dayData.macros[mealId];
  if (!base) return null;
  const eaten = checks[cKey(dayData.day, mealId)] || false;
  const por   = portions[pKey(dayData.day, mealId)] ?? 1.0;
  return (
    <div className={`meal-card ${eaten?"eaten":"not-eaten"}`}>
      <div className="meal-top" onClick={() => onToggle(mealId)}>
        <div className={`mcbox ${eaten?"on":""}`}>{eaten&&<span className="ctick">✓</span>}</div>
        <div className="meal-info">
          <div className="meal-time">{MEAL_TIMES[mealId]}</div>
          <div className={`meal-name ${eaten?"on":""}`}>{MEAL_LABELS[mealId]}</div>
          <div className="meal-desc">{base.label}</div>
        </div>
      </div>
      <div className="meal-macros">
        <span className={`mbadge p ${!eaten?"faded":""}`}>{Math.round(base.P*por)}g protein</span>
        <span className={`mbadge ${!eaten?"faded":""}`}>{Math.round(base.C*por)}g carbs</span>
        <span className={`mbadge ${!eaten?"faded":""}`}>{Math.round(base.F*por)}g fat</span>
        <span className={`mbadge ${!eaten?"faded":""}`}>{Math.round(base.Cal*por)} kcal</span>
      </div>
      <div className="portion-row">
        <span className="por-lbl">ATE:</span>
        <div className="por-btns">
          {PORTIONS.map(p => (
            <button key={p} className={`por-btn ${por===p?"on":""}`} onClick={() => onPortion(mealId,p)}>
              {PORTION_LABELS[p]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FoodLogger({ dayNum, items, onAdd, onRemove }) {
  const [text,    setText]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const ref = useRef(null);

  const handleLog = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(null);
    try {
      const result = await estimateMacros(text.trim());
      onAdd(dayNum, { id:Date.now(), desc:result.summary||text.trim(), P:result.P||0, C:result.C||0, F:result.F||0, Cal:result.Cal||0 });
      setText("");
      if (ref.current) ref.current.style.height = "auto";
    } catch { setError("Couldn't estimate — try describing it a bit differently."); }
    finally { setLoading(false); }
  };

  return (
    <div className="food-logger">
      <div className="food-logger-title"><span>✨</span> Log Other Food — AI Estimates Macros</div>
      <div className="food-input-row">
        <textarea ref={ref} className="food-input" rows={2}
          placeholder={'e.g. "2 slices pizza and a glass of wine" or "Chipotle burrito bowl"'}
          value={text} disabled={loading}
          onChange={e => { setText(e.target.value); e.target.style.height="auto"; e.target.style.height=e.target.scrollHeight+"px"; }}
          onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleLog();} }}/>
        <button className="log-btn" onClick={handleLog} disabled={loading||!text.trim()}>
          {loading?"…":"Log it"}
        </button>
      </div>
      {loading && <div className="log-thinking"><div className="spinner"/>Estimating macros…</div>}
      {error   && <div className="log-error">⚠️ {error}</div>}
      {items.length > 0 && (
        <div className="logged-items">
          {items.map(item => (
            <div key={item.id} className="logged-item">
              <span className="logged-icon">{item.Cal>600?"⚠️":"🍽"}</span>
              <div className="logged-info">
                <div className="logged-desc">{item.desc}</div>
                <div className="logged-macros">
                  <span className="lmbadge p">{item.P}g protein</span>
                  <span className="lmbadge">{item.C}g carbs</span>
                  <span className="lmbadge">{item.F}g fat</span>
                  <span className={`lmbadge ${item.Cal>600?"warn":""}`}>{item.Cal} kcal</span>
                </div>
              </div>
              <button className="del-btn" onClick={() => onRemove(dayNum,item.id)}>✕</button>
            </div>
          ))}
        </div>
      )}
      <div className="log-hint">Macros are AI estimates — close enough to keep you aware. Adds to your daily goals above.</div>
    </div>
  );
}

function DayCard({ dayData, checks, portions, other, weights, onToggle, onPortion, onAddFood, onRemoveFood, onWeightChange }) {
  const [open, setOpen] = useState(false);
  const pct = completionPct(dayData.day, checks);
  const { P, C, F, Cal } = calcCheckedMacros(dayData, checks, portions, other);

  return (
    <div className={`day-card ${open?"open":""}`}>
      <div className="day-header" onClick={() => setOpen(o=>!o)}>
        <div className="day-badge">
          <span className="badge-dow">{dayData.dow}</span>
          <span className="badge-num">{dayData.day}</span>
        </div>
        <div className="day-hinfo">
          <div className="day-htitle">{dayData.workout}</div>
          <div className="day-hprev">{dayData.macros.breakfast.label}</div>
        </div>
        <div className="day-hright">
          <span className={`pct-txt ${pct===100?"done":""}`}>{pct===100?"✓ Done":`${pct}%`}</span>
          <MiniRing pct={pct}/>
          <span className={`chevron ${open?"open":""}`}>▼</span>
        </div>
      </div>

      {open && (
        <div className="day-body">
          <GoalsSection dayData={dayData} checks={checks} portions={portions}
            other={other} weights={weights}
            onToggle={onToggle} onWeightChange={onWeightChange}/>
          <div className="day-inner">
            <div className="macro-strip">
              <div className="mc prot"><div className="mc-val">{P}g</div><div className="mc-lbl">PROTEIN</div></div>
              <div className="mc"><div className="mc-val">{C}g</div><div className="mc-lbl">CARBS</div></div>
              <div className="mc"><div className="mc-val">{F}g</div><div className="mc-lbl">FAT</div></div>
              <div className="mc"><div className="mc-val">{Cal}</div><div className="mc-lbl">KCAL</div></div>
            </div>
            <div className="macro-note">Totals update as you check off meals eaten</div>

            <div className="sec-title">💧 Water Checkpoints</div>
            <div className="water-grid">
              {WATER.map(w => {
                const on = checks[cKey(dayData.day,w.id)]||false;
                return (
                  <div key={w.id} className={`water-cell ${on?"on":""}`} onClick={() => onToggle(dayData.day,w.id)}>
                    <span className="w-icon">{on?"✅":"🫗"}</span>
                    <span className="w-oz">{w.label}</span>
                    <span className="w-by">by {w.by}</span>
                  </div>
                );
              })}
            </div>

            <div className="day-cols">
              <div>
                <div className="sec-title">🍽 Meals — check when eaten</div>
                {MEAL_IDS.map(m => (
                  <MealCard key={m} mealId={m} dayData={dayData}
                    checks={checks} portions={portions}
                    onToggle={id => onToggle(dayData.day,id)}
                    onPortion={(id,p) => onPortion(dayData.day,id,p)}/>
                ))}
              </div>
              <div>
                <div className="sec-title">🏃 Walk</div>
                <div style={{fontSize:12,color:"var(--muted)",padding:"4px 6px",marginBottom:14}}>{dayData.walk}</div>
                <div className="sec-title">🚴 PM Workout</div>
                <div style={{fontSize:11.5,lineHeight:1.5,padding:"4px 6px"}}>{dayData.workout}</div>
              </div>
            </div>

            <FoodLogger dayNum={dayData.day} items={other[dayData.day]||[]}
              onAdd={onAddFood} onRemove={onRemoveFood}/>

            <div className="skip-note">
              <strong>Missed workout?</strong> Never skip the whole day — do 20-min ride + 20-min walk instead.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [checks,   setChecks]   = useState(() => lsGet("sr30-chk-v6",  defaultChecks()));
  const [portions, setPortions] = useState(() => lsGet("sr30-por-v6",  defaultPortions()));
  const [other,    setOther]    = useState(() => lsGet("sr30-oth-v6",  defaultOther()));
  const [weights,  setWeights]  = useState(() => lsGet("sr30-wgt-v6",  defaultWeights()));
  const [week,     setWeek]     = useState(1);

  useEffect(() => { lsSet("sr30-chk-v6",  checks);   }, [checks]);
  useEffect(() => { lsSet("sr30-por-v6",  portions); }, [portions]);
  useEffect(() => { lsSet("sr30-oth-v6",  other);    }, [other]);
  useEffect(() => { lsSet("sr30-wgt-v6",  weights);  }, [weights]);

  const handleToggle      = (d,id)   => setChecks(p  => ({...p, [cKey(d,id)]: !p[cKey(d,id)]}));
  const handlePortion     = (d,m,v)  => setPortions(p=> ({...p, [pKey(d,m)]: v}));
  const handleAddFood     = (d,item) => setOther(p   => ({...p, [d]: [...(p[d]||[]),item]}));
  const handleRemoveFood  = (d,id)   => setOther(p   => ({...p, [d]: (p[d]||[]).filter(i=>i.id!==id)}));
  const handleWeightChange= (d,val)  => setWeights(p => ({...p, [d]: val}));

  const handleReset = () => {
    if (!window.confirm("Reset all progress, meals, and logged food?")) return;
    const c=defaultChecks(),p=defaultPortions(),o=defaultOther(),w=defaultWeights();
    setChecks(c); setPortions(p); setOther(o); setWeights(w);
  };

  const weekDays   = ALL_DAYS.slice((week-1)*7, week*7);
  const totalDone  = ALL_DAYS.reduce((s,d)=>s+ALL_CHECK_IDS.filter(id=>checks[cKey(d.day,id)]).length,0);
  const overallPct = Math.round(totalDone/(30*ALL_CHECK_IDS.length)*100);
  const weekPct    = w => {
    const days = ALL_DAYS.slice((w-1)*7,w*7);
    const done = days.reduce((s,d)=>s+ALL_CHECK_IDS.filter(id=>checks[cKey(d.day,id)]).length,0);
    return Math.round(done/(days.length*ALL_CHECK_IDS.length)*100);
  };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="header">
          <div className="h-inner">
            <div className="h-eye">30-Day Fat Loss Protocol</div>
            <div className="h-name">Sarah Rivera</div>
            <div className="h-sub">Wake 6:30 AM · Bed 9:30 PM · No decisions, stay moving</div>
            <div className="pillars">
              {["140g Protein","1 Gal Water","10k Steps","AM Walk","PM Workout","Meals Plated","Kitchen Off @ 8 PM"].map(p=>
                <span key={p} className="pillar">{p}</span>)}
            </div>
          </div>
        </div>

        <div className="overall-bar">
          <span className="bar-label">30-DAY TOTAL</span>
          <div className="bar-track"><div className="bar-fill green" style={{width:`${overallPct}%`}}/></div>
          <span className="bar-num">{overallPct}%</span>
        </div>

        <div className="week-tabs">
          {[1,2,3,4].map(w=>(
            <button key={w} className={`week-tab ${week===w?"active":""}`} onClick={()=>setWeek(w)}>
              WEEK {w}<span className="week-tab-pct">{weekPct(w)}%</span>
            </button>
          ))}
        </div>

        <div className="day-grid">
          {weekDays.map(d=>(
            <DayCard key={d.day} dayData={d}
              checks={checks} portions={portions} other={other} weights={weights}
              onToggle={handleToggle} onPortion={handlePortion}
              onAddFood={handleAddFood} onRemoveFood={handleRemoveFood}
              onWeightChange={handleWeightChange}/>
          ))}
        </div>

        <button className="reset-btn" onClick={handleReset}>RESET ALL PROGRESS</button>
      </div>
    </>
  );
}
