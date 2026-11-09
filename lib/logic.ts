/* Pure logic for the Ad Copy Length Checker: no React, no DOM, so it runs in Node for checks too. */

const segmenter = typeof Intl !== 'undefined' && 'Segmenter' in Intl ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;
/** Characters the way people see them, so Bangla conjuncts and emoji count once. */
export const graphemes = (s: string): string[] => (segmenter ? Array.from(segmenter.segment(s), (x) => x.segment) : [...s]);

/* ---------- Limits */

export type LimitKind = 'hard' | 'soft';

export interface OverField { label: string; kind: LimitKind }

export const SUMMARY_OK = 'Counts characters the way people see them, so Bangla conjuncts and emoji count once.';

/** The line above the sheet: which fields are too long and what each platform does about it. */
export function summarize(over: readonly OverField[]): string {
  if (!over.length) return SUMMARY_OK;
  const google = over.some((s) => s.kind === 'hard'), meta = over.some((s) => s.kind === 'soft');
  const why = google && meta
    ? ' Google will not accept the Google ones, and Meta will likely cut the Meta ones behind “See more”.'
    : google ? ' Google will not accept these.' : ' Meta will likely cut these behind “See more”.';
  return `${over.length} field${over.length > 1 ? 's are' : ' is'} too long: ${over.map((s) => s.label).join(', ')}.${why}`;
}

/** The message after a field's count: how far over, or how close to the limit. */
export function fieldMessage(n: number, max: number, kind: LimitKind): string {
  if (n > max) return `${n - max} over. ${kind === 'hard' ? 'Google will not accept this' : 'Meta will likely cut this behind “See more”'}`;
  return n >= max * 0.85 ? `${max - n} left` : '';
}

/* ---------- The ruler */

/** Positions a ruler runs to: the limit plus room to show how far a line runs over. */
export const rulerTotal = (limit: number) => limit + Math.max(Math.ceil(limit * 0.18), 5);

export interface RulerBand { min: number; max: number; every: number; major: number }

const MAJOR_STEPS = [5, 10, 20, 25, 30, 50];

function densityAt(width: number, limit: number, total: number, numbers: boolean) {
  const step = (width - 2) / total;
  const major = numbers ? MAJOR_STEPS.slice(limit < 30 ? 0 : 1).find((s) => s * step >= 34 && limit % s === 0) ?? limit : 0;
  return { every: step >= 3 ? 1 : 5, major };
}

/**
 * Ranges of ruler width with their own tick density, so one prerendered picture can serve every viewport: each band
 * is drawn and CSS container queries show the one that fits. Widths under 250 never occur in this layout.
 */
export function rulerBands(limit: number, total: number, numbers: boolean): RulerBand[] {
  const cuts = [3 * total + 2, ...(numbers ? MAJOR_STEPS.map((s) => Math.ceil((34 * total) / s + 2)) : [])];
  const edges = [0, ...[...new Set(cuts)].filter((w) => w >= 250).sort((a, b) => a - b), Infinity];
  const bands: RulerBand[] = [];
  for (let i = 0; i < edges.length - 1; i++) {
    const min = edges[i], max = edges[i + 1];
    const d = densityAt(Number.isFinite(max) ? max - 1 : Math.max(min, 1000), limit, total, numbers);
    const last = bands[bands.length - 1];
    if (last && last.every === d.every && last.major === d.major) last.max = max;
    else bands.push({ min, max, ...d });
  }
  return bands;
}

/** One path of vertical ticks for positions from..to, in a coordinate system of one unit per character. */
export function tickPath(from: number, to: number, band: RulerBand, limit: number, minor: number, five: number): string {
  let d = '';
  for (let i = from; i <= to; i++) {
    if (i % band.every) continue;
    const len = band.major && i % band.major === 0 && i <= limit ? 22 : i % 5 === 0 ? five : minor;
    d += `M${i} 0V${len}`;
  }
  return d;
}
