import { graphemes, summarize, type LimitKind, type OverField } from '@/lib/logic';

export type Group = 'headline' | 'description' | 'path' | 'metaText' | 'metaHead';

export interface FieldSpec { id: string; label: string; max: number; kind: LimitKind }

const SPEC: Record<Group, (n: number) => FieldSpec> = {
  headline: (n) => ({ id: `cc-h${n}`, label: `Headline ${n}`, max: 30, kind: 'hard' }),
  description: (n) => ({ id: `cc-d${n}`, label: `Description ${n}`, max: 90, kind: 'hard' }),
  path: (n) => ({ id: `cc-p${n}`, label: `Path ${n}`, max: 15, kind: 'hard' }),
  metaText: () => ({ id: 'cc-mp', label: 'Primary text', max: 125, kind: 'soft' }),
  metaHead: () => ({ id: 'cc-mh', label: 'Headline', max: 40, kind: 'soft' }),
};

export const specOf = (group: Group, index: number) => SPEC[group](index + 1);

const SAMPLE: Record<Group, readonly string[]> = {
  headline: ['Handloom Sarees from Tangail', 'Free Home Delivery Across All of Dhaka', 'তাঁতের শাড়ি, ঈদের আগেই ঘরে পৌঁছে যাবে'],
  description: ['Pure cotton and half-silk sarees woven in Tangail. Order online and pay on delivery.', 'সুতি ও হাফ সিল্ক শাড়ি। অনলাইনে অর্ডার করুন, ডেলিভারির সময় টাকা দিন।'],
  path: ['sarees', 'tangail'],
  metaText: ['Our new Tangail collection has landed: pure cotton and half-silk sarees, woven by hand and ready for Eid. Order online today and pay when it reaches your door, anywhere in Bangladesh.'],
  metaHead: ['Handloom Sarees for Eid'],
};

export const GROUP_LIMIT = { headline: 15, description: 4 } as const;
export const GROUP_BASE = { headline: 3, description: 2 } as const;
export type Growable = keyof typeof GROUP_LIMIT;

const ORDER: readonly Group[] = ['headline', 'description', 'path', 'metaText', 'metaHead'];

interface Line { value: string; n: number }
const line = (value: string): Line => ({ value, n: graphemes(value).length });
const clone = (from: Record<Group, readonly Line[]>) => Object.fromEntries(ORDER.map((g) => [g, [...from[g]]])) as Record<Group, Line[]>;

let lines = Object.fromEntries(ORDER.map((g) => [g, SAMPLE[g].map(line)])) as Record<Group, Line[]>;
let saved: Record<Group, Line[]> | null = null;
let version = 0;
const listeners = new Set<() => void>();

function changed() {
  version++;
  for (const fn of listeners) fn();
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export const getVersion = () => version;
export const countOf = (group: Group) => lines[group].length;
export const valueOf = (group: Group, index: number) => lines[group][index]?.value ?? '';
export const graphemeCount = (group: Group, index: number) => lines[group][index]?.n ?? 0;
export const isCleared = () => saved !== null;

/** Filled lines of a group, trimmed, with the limit they are set against. */
export function filled(group: Group) {
  return lines[group]
    .map((l, i) => ({ text: l.value.trim(), max: specOf(group, i).max }))
    .filter((l) => l.text);
}

export function setValue(group: Group, index: number, value: string) {
  lines[group][index] = line(value);
  changed();
}

export function addLine(group: Growable) {
  if (lines[group].length >= GROUP_LIMIT[group]) return;
  lines[group].push(line(''));
  changed();
}

// Later lines move up one, so the row that goes away is always the last.
export function removeLine(group: Growable, index: number) {
  lines[group].splice(index, 1);
  changed();
}

export function clearOrRestore() {
  if (!saved) {
    saved = clone(lines);
    lines = Object.fromEntries(ORDER.map((g) => [g, lines[g].map(() => line(''))])) as Record<Group, Line[]>;
  } else {
    const restored = clone(saved);
    restored.headline.length = Math.min(restored.headline.length, GROUP_BASE.headline);
    restored.description.length = Math.min(restored.description.length, GROUP_BASE.description);
    lines = restored;
    saved = null;
  }
  changed();
}

/** Recomputed from cached counts on every change, so it costs a scan of a few numbers per keystroke. */
export function summary(): string {
  const over: OverField[] = [];
  for (const g of ORDER) {
    lines[g].forEach((l, i) => {
      const s = specOf(g, i);
      if (l.n > s.max) over.push({ label: s.label, kind: s.kind });
    });
  }
  return summarize(over);
}
