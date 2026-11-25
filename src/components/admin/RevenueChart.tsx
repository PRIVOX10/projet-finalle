"use client";

import { useState } from "react";
import type { DayPoint } from "@/lib/dashboard";
import { formatPrice } from "@/lib/format";

const dayFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
const label = (day: string) => dayFormat.format(new Date(`${day}T00:00:00Z`));

/** Pas « rond » (1, 2 ou 5 × 10ⁿ) donnant au plus 4 graduations. */
function niceMax(max: number) {
  if (max <= 0) return { top: 1000, step: 250 };
  const raw = max / 4;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((n) => n * power).find((candidate) => candidate >= raw) ?? raw;
  return { top: Math.ceil(max / step) * step, step };
}

function compact(value: number) {
  return value >= 10_000 ? `${value / 1000}k` : new Intl.NumberFormat("fr-FR").format(value);
}

export function RevenueChart({ points, currency }: { points: DayPoint[]; currency: string }) {
  const [active, setActive] = useState<number | null>(null);
  const { top, step } = niceMax(Math.max(...points.map((point) => point.value)));
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, index) => index * step);

  const x = (index: number) => (index / (points.length - 1)) * 100;
  const y = (value: number) => 100 - (value / top) * 100;
  const line = points.map((point, index) => `${x(index)},${y(point.value)}`).join(" ");
  const current = active === null ? null : points[active];
  const edge = active !== null && x(active) > 70;

  function pick(event: React.PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left) / box.width;
    setActive(Math.max(0, Math.min(points.length - 1, Math.round(ratio * (points.length - 1)))));
  }

  function onKey(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    setActive((index) => Math.max(0, Math.min(points.length - 1, (index ?? points.length) + delta)));
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative h-56 w-10 shrink-0 text-right text-xs tabular-nums text-plum-soft" aria-hidden="true">
          {ticks.map((tick) => (
            <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ top: `${y(tick)}%` }}>
              {compact(tick)}
            </span>
          ))}
        </div>
        <div
          role="img"
          tabIndex={0}
          aria-label={`Ventes par jour sur ${points.length} jours. Le détail est disponible dans le tableau sous le graphique.`}
          onPointerMove={pick}
          onPointerDown={pick}
          onPointerLeave={() => setActive(null)}
          onBlur={() => setActive(null)}
          onKeyDown={onKey}
          className="relative h-56 flex-1 touch-pan-y"
        >
          {ticks.map((tick) => (
            <div key={tick} className="absolute inset-x-0 h-px bg-line" style={{ top: `${y(tick)}%` }} />
          ))}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
            <polygon points={`0,100 ${line} 100,100`} className="fill-chart" fillOpacity="0.1" />
            <polyline
              points={line}
              fill="none"
              className="stroke-chart"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {current && active !== null && (
            <>
              <div className="absolute inset-y-0 w-px bg-plum-soft" style={{ left: `${x(active)}%` }} />
              <div
                className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-chart"
                style={{ left: `${x(active)}%`, top: `${y(current.value)}%` }}
              />
              <div
                className={`pointer-events-none absolute top-1 z-10 whitespace-nowrap rounded-lg bg-plum px-3 py-1.5 text-wax shadow-lg ${
                  edge ? "-translate-x-full" : ""
                }`}
                style={{ left: `calc(${x(active)}% ${edge ? "- 8px" : "+ 8px"})` }}
              >
                <p className="text-sm font-semibold">{formatPrice(current.value, currency)}</p>
                <p className="text-xs opacity-80">{label(current.day)}</p>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="ml-12 mt-2 flex justify-between text-xs text-plum-soft" aria-hidden="true">
        <span>{label(points[0].day)}</span>
        <span>{label(points[Math.floor(points.length / 2)].day)}</span>
        <span>{label(points[points.length - 1].day)}</span>
      </div>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-plum-soft">Voir le tableau</summary>
        <div className="mt-2 max-h-56 overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-plum-soft">
                <th className="py-1 font-medium">Jour</th>
                <th className="py-1 text-right font-medium">Ventes</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.day} className="border-t border-line">
                  <td className="py-1">{label(point.day)}</td>
                  <td className="py-1 text-right tabular-nums">{formatPrice(point.value, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
