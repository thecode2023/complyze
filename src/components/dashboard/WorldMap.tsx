"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface JurisdictionMapData {
  code: string;
  name: string;
  regulationCount: number;
  velocityLevel: "high" | "medium" | "low";
  velocityScore: number;
  isTracked: boolean;
  hasRecentUpdate: boolean;
  complianceStatus: string;
}

interface WorldMapProps {
  jurisdictions: JurisdictionMapData[];
}

/* ------------------------------------------------------------------ */
/* Geographic pin locations (longitude/latitude → SVG x,y)             */
/* Using Equirectangular projection: x = (lon+180)*2.67, y=(90-lat)*2 */
/* ViewBox is 960 x 360                                                */
/* ------------------------------------------------------------------ */

const jurisdictionPins: Record<string, { x: number; y: number; label: string }> = {
  EU:      { x: 510, y: 115, label: "EU" },
  GB:      { x: 480, y: 100, label: "UK" },
  US:      { x: 210, y: 132, label: "US" },
  "US-TX": { x: 195, y: 152, label: "TX" },
  "US-CO": { x: 175, y: 135, label: "CO" },
  "US-CA": { x: 145, y: 138, label: "CA" },
  "US-IL": { x: 220, y: 130, label: "IL" },
  CA:      { x: 195, y: 95,  label: "CA" },
  BR:      { x: 325, y: 228, label: "BR" },
  SG:      { x: 720, y: 191, label: "SG" },
  ID:      { x: 735, y: 205, label: "ID" },
  INTL:    { x: 510, y: 160, label: "OECD" },
};

/* ------------------------------------------------------------------ */
/* Simplified Natural Earth continent wireframes                       */
/* Recognizable outlines — stroke only, no fill                        */
/* ------------------------------------------------------------------ */

const continentPaths = [
  // North America
  "M130,62 L145,55 L175,52 L210,48 L235,52 L255,60 L268,72 L270,85 L265,98 L258,108 L250,115 L244,118 L238,122 L232,128 L242,132 L248,140 L250,148 L248,155 L240,160 L232,165 L225,168 L218,172 L210,174 L200,176 L192,178 L185,175 L178,172 L170,168 L162,172 L155,170 L148,165 L140,162 L132,158 L125,155 L118,150 L112,145 L108,138 L105,130 L102,122 L105,115 L110,108 L115,100 L118,92 L122,82 L128,72 Z",
  // Central America / Caribbean
  "M190,178 L195,182 L200,188 L205,192 L210,195 L215,198 L220,202 L225,205",
  // South America
  "M255,195 L260,190 L270,188 L282,190 L295,192 L308,198 L318,205 L325,215 L330,225 L332,238 L330,250 L325,262 L318,272 L308,280 L298,286 L288,290 L278,288 L268,282 L260,275 L255,265 L250,255 L248,242 L248,230 L250,218 L252,208 L254,200 Z",
  // Europe
  "M460,72 L468,68 L478,65 L490,68 L502,72 L512,78 L520,85 L528,92 L535,100 L538,108 L540,118 L538,128 L532,135 L525,142 L518,148 L510,152 L502,155 L495,152 L488,148 L480,145 L472,140 L465,135 L458,128 L452,120 L448,112 L448,102 L450,92 L455,82 Z",
  // Scandinavia
  "M495,55 L502,48 L510,45 L518,50 L522,58 L520,68 L515,75 L508,72",
  // Africa
  "M475,160 L485,158 L498,162 L510,168 L520,175 L528,185 L535,198 L538,210 L538,225 L535,238 L530,250 L522,260 L512,268 L500,272 L488,270 L478,265 L470,258 L465,248 L462,238 L460,225 L460,212 L462,200 L465,188 L468,178 L472,168 Z",
  // Asia (mainland)
  "M545,55 L565,50 L590,48 L620,50 L650,55 L680,62 L710,68 L730,75 L748,85 L758,98 L762,112 L760,125 L755,138 L748,148 L738,155 L725,160 L710,165 L695,168 L680,170 L665,168 L650,165 L635,160 L620,155 L605,150 L590,145 L575,138 L562,130 L552,120 L545,110 L540,98 L538,85 L540,72 L542,62 Z",
  // India subcontinent
  "M645,145 L655,148 L662,155 L668,165 L672,178 L670,190 L665,198 L658,202 L650,200 L642,195 L638,185 L636,175 L638,165 L640,155 Z",
  // Southeast Asia peninsula
  "M700,158 L708,165 L712,175 L710,185 L705,192 L698,195 L692,190 L690,180 L692,170 L695,162 Z",
  // Indonesia archipelago
  "M710,198 L718,196 L728,198 L738,200 L748,202 L756,205 L762,210 L758,215 L748,218 L738,218 L728,216 L718,212 L712,208 L710,202 Z",
  // Japan
  "M785,100 L790,95 L792,105 L790,115 L785,120 L782,112",
  // Australia
  "M740,248 L755,240 L772,238 L790,242 L805,250 L812,262 L810,275 L802,285 L788,292 L772,294 L758,290 L748,282 L742,272 L738,260 L740,252 Z",
  // New Zealand
  "M825,290 L830,285 L832,295 L828,302 L824,296",
  // UK / Ireland detail
  "M462,82 L466,78 L470,82 L472,90 L470,98 L466,102 L462,98 L460,90 Z",
  "M455,85 L458,82 L460,88 L458,92 L455,90 Z",
];

/* ------------------------------------------------------------------ */
/* Velocity color config                                               */
/* ------------------------------------------------------------------ */

const velocityGlow = {
  high:   { core: "#ef4444", mid: "#ef444480", outer: "#ef444425", filter: "url(#glowRed)" },
  medium: { core: "#f59e0b", mid: "#f59e0b80", outer: "#f59e0b25", filter: "url(#glowAmber)" },
  low:    { core: "#10b981", mid: "#10b98180", outer: "#10b98125", filter: "url(#glowGreen)" },
};

/* ------------------------------------------------------------------ */
/* Tooltip state                                                       */
/* ------------------------------------------------------------------ */

interface TooltipState {
  x: number;
  y: number;
  data: JurisdictionMapData;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function WorldMap({ jurisdictions }: WorldMapProps) {
  const router = useRouter();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const dataMap = useMemo(
    () => new Map(jurisdictions.map((j) => [j.code, j])),
    [jurisdictions]
  );

  // Build connection lines between tracked jurisdictions
  const trackedPins = useMemo(() => {
    return jurisdictions
      .filter((j) => j.isTracked && jurisdictionPins[j.code])
      .map((j) => jurisdictionPins[j.code]);
  }, [jurisdictions]);

  const connectionLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < trackedPins.length; i++) {
      for (let k = i + 1; k < trackedPins.length; k++) {
        const a = trackedPins[i];
        const b = trackedPins[k];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        // Only connect reasonably close pins to avoid visual clutter
        if (dist < 350) {
          lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
        }
      }
    }
    return lines;
  }, [trackedPins]);

  const handleClick = useCallback(
    (code: string) => {
      router.push(`/feed?jurisdiction=${code}`);
    },
    [router]
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent, code: string) => {
      const data = dataMap.get(code);
      if (!data) return;
      const rect = (e.currentTarget as SVGElement).closest("svg")?.getBoundingClientRect();
      if (!rect) return;
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        data,
      });
    },
    [dataMap]
  );

  return (
    <div className="hidden md:block rounded-lg border border-border overflow-hidden relative">
      {/* Dark base with subtle gradient */}
      <div className="absolute inset-0 bg-[#0a0e14]" />
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/10 via-transparent to-cyan-950/5" />

      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)",
        }}
      />

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-[10px] font-semibold text-cyan-400/80 uppercase tracking-[0.2em]">
              Regulatory Intelligence — Global Monitor
            </h3>
          </div>
          <div className="flex items-center gap-4 text-[9px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
              High
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
              Medium
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
              Low
            </span>
          </div>
        </div>

        {/* Map */}
        <div className="relative">
          <svg
            viewBox="0 0 960 360"
            className="w-full h-auto"
            style={{ maxHeight: "300px" }}
          >
            <defs>
              {/* Glow filters */}
              <filter id="glowRed" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feFlood floodColor="#ef4444" floodOpacity="0.6" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glowAmber" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feFlood floodColor="#f59e0b" floodOpacity="0.6" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glowGreen" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feFlood floodColor="#10b981" floodOpacity="0.6" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glowCyan" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feFlood floodColor="#22d3ee" floodOpacity="0.3" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Grid pattern */}
              <pattern id="radarGrid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path
                  d="M 48 0 L 0 0 0 48"
                  fill="none"
                  stroke="rgba(34,211,238,0.04)"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>

            {/* Background grid */}
            <rect width="960" height="360" fill="url(#radarGrid)" />

            {/* Latitude/longitude reference lines */}
            {[60, 120, 180, 240, 300].map((y) => (
              <line
                key={`lat-${y}`}
                x1="0" y1={y} x2="960" y2={y}
                stroke="rgba(34,211,238,0.03)"
                strokeWidth="0.5"
                strokeDasharray="4 8"
              />
            ))}
            {[160, 320, 480, 640, 800].map((x) => (
              <line
                key={`lon-${x}`}
                x1={x} y1="0" x2={x} y2="360"
                stroke="rgba(34,211,238,0.03)"
                strokeWidth="0.5"
                strokeDasharray="4 8"
              />
            ))}

            {/* Continent wireframes */}
            {continentPaths.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="rgba(34,211,238,0.08)"
                strokeWidth="0.8"
                strokeLinejoin="round"
              />
            ))}

            {/* Network connection lines between tracked jurisdictions */}
            {connectionLines.map((line, i) => (
              <line
                key={`conn-${i}`}
                x1={line.x1} y1={line.y1}
                x2={line.x2} y2={line.y2}
                stroke="rgba(34,211,238,0.06)"
                strokeWidth="0.5"
                strokeDasharray="2 6"
              />
            ))}

            {/* Jurisdiction markers */}
            {Object.entries(jurisdictionPins).map(([code, pin]) => {
              const data = dataMap.get(code);
              if (!data) return null;

              const glow = velocityGlow[data.velocityLevel];
              const isTracked = data.isTracked;
              const dotRadius = isTracked ? 4 : 2.5;
              const hasUpdate = data.hasRecentUpdate;

              return (
                <g key={code}>
                  {/* Outer ambient glow for tracked pins */}
                  {isTracked && (
                    <circle
                      cx={pin.x}
                      cy={pin.y}
                      r={12}
                      fill={glow.outer}
                      className="pointer-events-none"
                    />
                  )}

                  {/* Radar pulse rings for recent updates */}
                  {hasUpdate && isTracked && (
                    <>
                      <circle cx={pin.x} cy={pin.y} r="6" fill="none" stroke={glow.core} strokeWidth="1">
                        <animate attributeName="r" from="6" to="28" dur="3s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.5" to="0" dur="3s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={pin.x} cy={pin.y} r="6" fill="none" stroke={glow.core} strokeWidth="0.5">
                        <animate attributeName="r" from="6" to="28" dur="3s" begin="1s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.3" to="0" dur="3s" begin="1s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={pin.x} cy={pin.y} r="6" fill="none" stroke={glow.core} strokeWidth="0.3">
                        <animate attributeName="r" from="6" to="28" dur="3s" begin="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.2" to="0" dur="3s" begin="2s" repeatCount="indefinite" />
                      </circle>
                    </>
                  )}

                  {/* Mid glow ring */}
                  {isTracked && (
                    <circle
                      cx={pin.x}
                      cy={pin.y}
                      r={dotRadius + 3}
                      fill="none"
                      stroke={glow.mid}
                      strokeWidth="1"
                      className="pointer-events-none"
                    />
                  )}

                  {/* Core dot */}
                  <circle
                    cx={pin.x}
                    cy={pin.y}
                    r={dotRadius}
                    fill={glow.core}
                    opacity={isTracked ? 1 : 0.3}
                    filter={isTracked ? glow.filter : undefined}
                    className="cursor-pointer"
                    onClick={() => handleClick(code)}
                    onMouseEnter={(e) => handleMouseEnter(e, code)}
                    onMouseLeave={() => setTooltip(null)}
                  />

                  {/* Center highlight */}
                  {isTracked && (
                    <circle
                      cx={pin.x}
                      cy={pin.y}
                      r={1.5}
                      fill="white"
                      opacity="0.9"
                      className="pointer-events-none"
                    />
                  )}

                  {/* Jurisdiction code label */}
                  {isTracked && (
                    <text
                      x={pin.x}
                      y={pin.y - dotRadius - 6}
                      textAnchor="middle"
                      fill={glow.core}
                      fontSize="7"
                      fontWeight="600"
                      fontFamily="monospace"
                      opacity="0.7"
                      className="pointer-events-none select-none"
                    >
                      {pin.label}
                    </text>
                  )}

                  {/* Larger invisible hit area for hover/click */}
                  <circle
                    cx={pin.x}
                    cy={pin.y}
                    r={16}
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={() => handleClick(code)}
                    onMouseEnter={(e) => handleMouseEnter(e, code)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                </g>
              );
            })}

            {/* INTL / OECD — dashed orbit */}
            {dataMap.has("INTL") && (
              <>
                <ellipse
                  cx="480"
                  cy="180"
                  rx="420"
                  ry="150"
                  fill="none"
                  stroke="rgba(34,211,238,0.04)"
                  strokeWidth="0.5"
                  strokeDasharray="3 9"
                />
                <text
                  x="890"
                  y="335"
                  textAnchor="end"
                  fill="rgba(34,211,238,0.15)"
                  fontSize="7"
                  fontFamily="monospace"
                >
                  OECD/46
                </text>
              </>
            )}

            {/* Corner decorations — HUD style */}
            <g stroke="rgba(34,211,238,0.12)" strokeWidth="1" fill="none">
              <polyline points="2,12 2,2 12,2" />
              <polyline points="948,12 948,2 938,2" />
              <polyline points="2,348 2,358 12,358" />
              <polyline points="948,348 948,358 938,358" />
            </g>

            {/* Bottom status line */}
            <text x="10" y="354" fill="rgba(34,211,238,0.2)" fontSize="7" fontFamily="monospace">
              {jurisdictions.filter((j) => j.isTracked).length} ACTIVE · {jurisdictions.filter((j) => j.hasRecentUpdate).length} RECENT · {jurisdictions.length} TOTAL
            </text>
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute z-50 pointer-events-none"
              style={{
                left: Math.min(Math.max(tooltip.x - 80, 8), 700),
                top: Math.max(tooltip.y - 105, 8),
              }}
            >
              <div className="rounded border border-cyan-800/40 bg-[#0d1117]/95 backdrop-blur-sm px-3 py-2.5 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: velocityGlow[tooltip.data.velocityLevel].core,
                      boxShadow: `0 0 8px ${velocityGlow[tooltip.data.velocityLevel].core}`,
                    }}
                  />
                  <span className="text-xs font-semibold text-slate-200">{tooltip.data.name}</span>
                </div>
                <div className="space-y-0.5 text-[10px] font-mono">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">REGS</span>
                    <span className="text-slate-300">{tooltip.data.regulationCount}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">VELOCITY</span>
                    <span
                      style={{ color: velocityGlow[tooltip.data.velocityLevel].core }}
                    >
                      {tooltip.data.velocityLevel.toUpperCase()} ({tooltip.data.velocityScore})
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">STATUS</span>
                    <span className="text-slate-300 uppercase">{tooltip.data.complianceStatus}</span>
                  </div>
                  {tooltip.data.hasRecentUpdate && (
                    <div className="text-cyan-400 mt-1 text-[9px]">
                      ● RECENT ACTIVITY DETECTED
                    </div>
                  )}
                  {!tooltip.data.isTracked && (
                    <div className="text-slate-600 mt-1 text-[9px] italic">UNTRACKED</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
