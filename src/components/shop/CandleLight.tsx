import flames from "@/lib/bouquet-flames.json";

const FLAMES = flames as unknown as Record<string, [number, number, number][]>;

// Position, durée et départ de chaque braise du héros.
const EMBERS = [
  [34, 5.2, 0],
  [46, 6.4, 1.6],
  [58, 4.8, 0.8],
  [41, 7, 3],
  [63, 5.8, 2.2],
  [52, 6.6, 4],
];

function flamesFor(src: string) {
  const name = src.match(/^\/bouquets\/kandili\/([\w-]+)\.jpg$/)?.[1];
  return name ? FLAMES[name] : undefined;
}

/**
 * Lumière de bougie posée sur une image, visible seulement en mode sombre.
 * Les photos relevées dans bouquet-flames.json reçoivent une flamme sur chaque
 * mèche ; une photo envoyée depuis le dashboard reçoit la lueur seule.
 */
export function CandleLight({ src, embers = false }: { src: string; embers?: boolean }) {
  return (
    <span aria-hidden="true" className="candle-light">
      <span className="candle-vignette" />
      <span className="candle-glow" />
      {flamesFor(src)?.map(([x, y, width], index) => (
        <span
          key={index}
          className="candle"
          style={
            {
              left: `${x}%`,
              top: `${y}%`,
              width: `${width}%`,
              "--order": index,
              "--flicker": `${1 + (index % 4) * 0.17}s`,
            } as React.CSSProperties
          }
        >
          <span className="candle-lit">
            <span className="candle-pool" />
            <span className="candle-halo" />
            <span className="candle-flame" />
          </span>
        </span>
      ))}
      {embers &&
        EMBERS.map(([left, duration, delay]) => (
          <span
            key={left}
            className="ember"
            style={{ left: `${left}%`, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
          />
        ))}
    </span>
  );
}
