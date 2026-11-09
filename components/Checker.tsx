'use client';

import { memo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { calm } from '@/components/client';
import { RulerArt } from '@/components/Ruler';
import { fieldMessage, graphemes, rulerTotal, SUMMARY_OK } from '@/lib/logic';
import {
  addLine, clearOrRestore, countOf, filled, getVersion, graphemeCount, GROUP_BASE, GROUP_LIMIT, isCleared, removeLine,
  setValue, specOf, subscribe, summary, valueOf, type Group, type Growable,
} from './store';

const Ruler = memo(RulerArt);
const useStore = <T,>(read: () => T) => useSyncExternalStore(subscribe, read, read);

/* ---------- One field */

interface FieldProps { group: Group; index: number; lang?: string; area?: boolean; live?: boolean; onRemove?: (index: number) => void }

// Only this row re-renders when its own line changes: it subscribes to one string, not to the whole sheet.
const Field = memo(function Field({ group, index, lang, area, live, onRemove }: FieldProps) {
  const value = useStore(() => valueOf(group, index));
  const n = useStore(() => graphemeCount(group, index));
  const rule = useRef<HTMLElement>(null);
  const { id, label, max, kind } = specOf(group, index);
  const total = rulerTotal(max);
  const over = n > max;
  const near = !over && n >= max * 0.85;

  const onInput = (next: string) => {
    const nextOver = graphemes(next).length > max;
    setValue(group, index, next);
    if (nextOver && !over && !calm()) rule.current?.classList.add('is-kick');
  };

  const input = { id, value, 'aria-describedby': `${id}-count`, 'aria-invalid': over && kind === 'hard' ? true : undefined, lang } as const;

  return (
    <div className={`cc-row${over ? ' is-over' : near ? ' is-near' : ''}`} data-kind={kind}>
      <div className="cc-row__top">
        <label htmlFor={id}>{label}</label>
        {onRemove ? <button type="button" className="cc-row__rm" aria-label={`Remove ${label}`} onClick={() => onRemove(index)}>Remove</button> : null}
        <span className="cc-count" id={`${id}-count`} aria-live={live ? 'off' : undefined}>
          <b>{n}</b><span className="cc-count__of"> of {max} </span><em>{fieldMessage(n, max, kind)}</em>
        </span>
      </div>
      <div className={area ? 'cc-input cc-input--area' : 'cc-input'}>
        {area
          ? <textarea rows={7} {...input} onChange={(e) => onInput(e.target.value)} />
          : <input autoComplete="off" {...input} onChange={(e) => onInput(e.target.value)} />}
      </div>
      <div className="gauge" aria-hidden="true" style={{ '--l': max / total, '--p': Math.min(n, total) / total, '--o': Math.min(1, Math.max(0, n - max) / (total - max)) }}>
        <Ruler limit={max} total={total} />
        <i className="g-over" />
        <i className="g-limit" ref={rule} onAnimationEnd={(e) => e.currentTarget.classList.remove('is-kick')} />
        <i className="g-mark" />
      </div>
    </div>
  );
});

/* ---------- Groups that can grow */

const NOUN: Record<Growable, string> = { headline: 'a headline', description: 'a description' };
const BN_ROWS: Record<Growable, number> = { headline: 2, description: 1 };

const Lines = memo(function Lines({ group }: { group: Growable }) {
  const count = useStore(() => countOf(group));
  const addRef = useRef<HTMLButtonElement>(null);
  const full = count >= GROUP_LIMIT[group];

  const add = () => {
    flushSync(() => addLine(group));
    document.getElementById(specOf(group, count).id)?.focus();
  };

  const remove = (at: number) => {
    flushSync(() => removeLine(group, at));
    const next = at < count - 1 ? document.getElementById(specOf(group, at).id) : addRef.current;
    next?.focus();
  };

  return (
    <>
      <div className="cc-grp__top">
        <p id={`cc-grp-${group[0]}`} className="cc-grp__t">
          {group === 'headline' ? 'Headlines' : 'Descriptions'} <span>{group === 'headline' ? '30' : '90'} characters each, hard limit</span>
        </p>
        <button ref={addRef} type="button" className="link-btn" disabled={full} onClick={add}>
          {full ? `Maximum reached (${GROUP_LIMIT[group]})` : <><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1v10M1 6h10" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg> Add {NOUN[group]} (up to {GROUP_LIMIT[group]})</>}
        </button>
      </div>
      <div className="cc-group">
        {Array.from({ length: count }, (_, i) => (
          <Field key={i} group={group} index={i} live={i < GROUP_BASE[group]} lang={i === BN_ROWS[group] ? 'bn' : undefined} onRemove={i >= GROUP_BASE[group] ? remove : undefined} />
        ))}
      </div>
    </>
  );
});

/* ---------- The sheet */

const TABS = [
  { id: 'cc-tab-g', panel: 'cc-g', label: 'Google responsive search ad' },
  { id: 'cc-tab-m', panel: 'cc-m', label: 'Meta ad' },
];
const STEP: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

function ClearButton({ tab }: { tab: number }) {
  const cleared = useStore(isCleared);
  const onClick = () => {
    const clearing = !isCleared();
    flushSync(clearOrRestore);
    if (clearing) document.getElementById(TABS[tab].panel)?.querySelector<HTMLElement>('input, textarea')?.focus();
  };
  return <button type="button" className="sheet__clear" onClick={onClick}>{cleared ? 'Restore the sample' : 'Clear the sheet'}</button>;
}

export function Sheet() {
  const [tab, setTab] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent) => {
    const step = STEP[e.key];
    const next = step ? (tab + step + TABS.length) % TABS.length : e.key === 'Home' ? 0 : e.key === 'End' ? TABS.length - 1 : -1;
    if (next < 0) return;
    e.preventDefault();
    setTab(next);
    tabs.current[next]?.focus();
  };

  return (
    <form className="sheet" noValidate autoComplete="off" onSubmit={(e) => e.preventDefault()}>
      <div className="sheet__top">
        <div className="tabs" role="tablist" aria-label="Ad platform">
          {TABS.map((t, i) => (
            <button key={t.id} type="button" role="tab" id={t.id} aria-selected={i === tab} aria-controls={t.panel} tabIndex={i === tab ? 0 : -1} ref={(el) => { tabs.current[i] = el; }} onClick={() => setTab(i)} onKeyDown={onKeyDown}>{t.label}</button>
          ))}
        </div>
        <p className="sheet__name">Ad Copy Length Checker</p>
        <ClearButton tab={tab} />
      </div>

      <div role="tabpanel" id="cc-g" aria-labelledby="cc-tab-g" hidden={tab !== 0}>
        <div className="cc-grp" role="group" aria-labelledby="cc-grp-h"><Lines group="headline" /></div>
        <div className="cc-grp" role="group" aria-labelledby="cc-grp-d"><Lines group="description" /></div>
        <div className="tool-ui__pair">
          <Field group="path" index={0} live />
          <Field group="path" index={1} live />
        </div>
      </div>

      <div role="tabpanel" id="cc-m" aria-labelledby="cc-tab-m" hidden={tab !== 1}>
        <Field group="metaText" index={0} area />
        <Field group="metaHead" index={0} live />
        <p className="field__hint">Meta numbers are working rules, not hard limits: many placements cut longer text behind “See more”.</p>
      </div>
    </form>
  );
}

/* ---------- The summary line */

export function Summary() {
  const text = useStore(summary);
  return <p className={`bench__note${text === SUMMARY_OK ? '' : ' is-over'}`} aria-live="polite">{text}</p>;
}

/* ---------- Previews */

function Cut({ text, max }: { text: string; max: number }): ReactNode {
  const g = graphemes(text);
  if (g.length <= max) return text;
  return <>{g.slice(0, max).join('')}<del>{g.slice(max).join('')}</del></>;
}

function Joined({ group, take, sep, empty, className }: { group: Group; take: number; sep: string; empty: string; className: string }) {
  useStore(getVersion);
  const list = filled(group).slice(0, take);
  if (!list.length) return <p className={`${className} is-empty`}>{empty}</p>;
  return <p className={className}>{list.map((l, i) => <span key={i}>{i ? sep : null}<Cut text={l.text} max={l.max} /></span>)}</p>;
}

export function PreviewHead() {
  return <Joined group="headline" take={3} sep=" | " empty="Your headlines appear here" className="gads__head" />;
}

export function PreviewDesc() {
  return <Joined group="description" take={2} sep=" " empty="Descriptions appear here." className="gads__desc" />;
}

export function PreviewPath() {
  useStore(getVersion);
  return <span>{filled('path').map((l, i) => <span key={i}>/<Cut text={l.text} max={l.max} /></span>)}</span>;
}

export function PreviewMeta() {
  useStore(getVersion);
  const [expanded, setExpanded] = useState(false);
  const value = valueOf('metaText', 0);
  const { max } = specOf('metaText', 0);
  const g = graphemes(value);
  const isCut = g.length > max;
  if (!isCut && expanded) setExpanded(false);
  const text = !value ? 'Primary text appears here.' : isCut && !expanded ? `${g.slice(0, max).join('').trimEnd()}…` : value;
  return (
    <p className={`mfeed__text${value ? '' : ' is-empty'}`}>
      <span>{text}</span> <button type="button" className="more" hidden={!isCut} onClick={() => setExpanded((v) => !v)}>{isCut ? (expanded ? 'See less' : 'See more') : ''}</button>
    </p>
  );
}

export function PreviewMetaHead() {
  useStore(getVersion);
  const value = valueOf('metaHead', 0);
  const { max } = specOf('metaHead', 0);
  const g = graphemes(value);
  const text = !value ? 'Headline' : g.length > max ? `${g.slice(0, max).join('').trimEnd()}…` : value;
  return <p className={`ad-preview__mh${value ? '' : ' is-empty'}`}>{text}</p>;
}
