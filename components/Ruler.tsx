import { rulerBands, tickPath, type RulerBand } from '@/lib/logic';

function bandClass({ min, max }: RulerBand) {
  return `g-v${min ? ` gmin${min}` : ''}${Number.isFinite(max) ? ` gmax${max}` : ''}`;
}

const pct = (at: number, total: number) => `${+((at / total) * 100).toFixed(3)}%`;

interface RulerProps {
  limit: number;
  total: number;
  /** Print numbers along the ruler. */
  numbers?: boolean;
  /** Draw the taller filled ticks that follow the count. */
  fill?: boolean;
  /** Stop the ticks at the limit, for the printed scales. */
  stopAtLimit?: boolean;
}

/**
 * A ruler drawn once, as one SVG at any width: ticks stretch with the width and stay one pixel wide, while numbers
 * sit at a percentage so they do not stretch. Everything that moves lives outside this and is driven by CSS variables.
 */
export function RulerArt({ limit, total, numbers = true, fill = true, stopAtLimit = false }: RulerProps) {
  const box = `0 0 ${total} 24`;
  return (
    <svg className="g-svg" width="100%" height="100%">
      {rulerBands(limit, total, numbers).map((band) => {
        const labels: number[] = [];
        if (band.major) for (let i = band.major; i < limit; i += band.major) labels.push(i);
        return (
          <g key={band.min} className={bandClass(band)}>
            <svg width="100%" height="24" viewBox={box} preserveAspectRatio="none" overflow="visible">
              <path className="g-b" d={tickPath(0, stopAtLimit ? limit : total, band, limit, 4, 7)} />
            </svg>
            {numbers ? (
              <g className="g-num">
                {labels.map((i) => <text key={i} x={pct(i, total)} dx="4" y="22">{i}</text>)}
                <text x={pct(limit, total)} dx="6" y="22" className="g-num--limit">{limit}</text>
              </g>
            ) : null}
            {fill ? (
              <g className="g-fill">
                <svg width="100%" height="24" viewBox={box} preserveAspectRatio="none" overflow="visible">
                  <path className="g-f" d={tickPath(0, limit, band, limit, 7, 9)} />
                  <path className="g-f g-f--out" d={tickPath(limit + 1, total, band, limit, 7, 9)} />
                </svg>
              </g>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
