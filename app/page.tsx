import type { Viewport } from 'next';
import { PreviewDesc, PreviewHead, PreviewMeta, PreviewMetaHead, PreviewPath, Sheet, Summary } from '@/components/Checker';
import { RulerArt } from '@/components/Ruler';
import { ToolBar, ToolFoot } from '@/components/Shell';
import { graphemes, rulerTotal } from '@/lib/logic';
import './page.css';

export const viewport: Viewport = { themeColor: '#e0562a', colorScheme: 'light' };

const Hex = () => <path d="M8.6 3h14.8l7.4 13-7.4 13H8.6L1.2 16z" fill="#f2a516" />;

function Previews() {
  return (
    <div className="previews">
      <article className="gads" aria-label="Preview of the Google search ad">
        <p className="gads__tag">Sponsored</p>
        <div className="gads__site">
          <span className="gads__fav" aria-hidden="true"><svg viewBox="0 0 32 32"><Hex /></svg></span>
          <span className="gads__who"><b>Your brand</b><span className="gads__url">yoursite.com<PreviewPath /></span></span>
          <svg className="gads__dots" viewBox="0 0 4 16" aria-hidden="true"><circle cx="2" cy="2" r="1.5" /><circle cx="2" cy="8" r="1.5" /><circle cx="2" cy="14" r="1.5" /></svg>
        </div>
        <PreviewHead />
        <PreviewDesc />
      </article>

      <article className="mfeed" aria-label="Preview of the Meta feed post">
        <div className="mfeed__top">
          <span className="mfeed__av" aria-hidden="true"><svg viewBox="0 0 32 32"><Hex /></svg></span>
          <span className="mfeed__who"><b>Your page</b><span>Sponsored <svg viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" /><path d="M1 6h10M6 1c3 3 3 7 0 10M6 1C3 4 3 8 6 11" fill="none" stroke="currentColor" /></svg></span></span>
          <svg className="mfeed__dots" viewBox="0 0 16 4" aria-hidden="true"><circle cx="2" cy="2" r="1.5" /><circle cx="8" cy="2" r="1.5" /><circle cx="14" cy="2" r="1.5" /></svg>
        </div>
        <PreviewMeta />
        <svg className="mfeed__img" viewBox="0 0 480 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <pattern id="jam" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="28" height="28" fill="#a8410f" /><path d="M14 3l11 11-11 11L3 14z" fill="#f2a516" /><path d="M14 9l5 5-5 5-5-5z" fill="#141311" /></pattern>
            <pattern id="warp" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#e0562a" /><rect width="2" height="6" fill="#a8410f" /></pattern>
          </defs>
          <rect width="480" height="240" fill="#141311" />
          <g transform="rotate(-14 240 120)">
            <rect x="-80" y="-60" width="640" height="120" fill="url(#warp)" />
            <rect x="-80" y="60" width="640" height="56" fill="url(#jam)" />
            <rect x="-80" y="116" width="640" height="8" fill="#f2a516" />
            <rect x="-80" y="124" width="640" height="150" fill="#f3f1ec" />
            <rect x="-80" y="150" width="640" height="4" fill="#a8410f" />
            <rect x="-80" y="160" width="640" height="4" fill="#a8410f" />
            <rect x="-80" y="274" width="640" height="60" fill="#141311" />
          </g>
        </svg>
        <div className="mfeed__foot">
          <div className="mfeed__link"><span>yoursite.com</span><PreviewMetaHead /></div>
          <span className="mfeed__cta">Shop now</span>
        </div>
      </article>
    </div>
  );
}

const WORD = 'শিক্ষা';
const hex = (c: string) => c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0');

function WorkedExample() {
  const points = [...WORD];
  const clusters = graphemes(WORD);
  const cols = { '--cols': points.length };
  return (
    <figure className="spec" data-in>
      <p className="spec__word" lang="bn">{WORD}</p>
      <div className="spec__rows">
        <div className="spec__row">
          <p className="spec__who">A plain counter sees</p>
          <div className="slugs slugs--naive" lang="bn" style={cols}>
            {points.map((c, i) => <span className="slug" key={i}><b>{c}</b><small>{hex(c)}</small></span>)}
          </div>
          <p className="spec__n">{points.length}</p>
        </div>
        <div className="spec__row">
          <p className="spec__who">A person sees</p>
          <div className="slugs slugs--person" lang="bn" style={cols}>
            {clusters.map((c, i) => <span className="slug" key={i} style={{ gridColumn: `span ${[...c].length}` }}><b>{c}</b></span>)}
          </div>
          <p className="spec__n spec__n--person">{clusters.length}</p>
        </div>
      </div>
      <figcaption>Counting by grapheme means a conjunct such as <span lang="bn">ক্ষ</span>, or an emoji, counts as one character. This checker gives the second number.</figcaption>
    </figure>
  );
}

const LIMIT_ROWS = [
  { field: 'Google headline', n: 30, allowed: 'Up to 15', past: 'Hard. Google will not accept it' },
  { field: 'Google description', n: 90, allowed: 'Up to 4', past: 'Hard. Google will not accept it' },
  { field: 'Display path', n: 15, allowed: '2 paths', past: 'Hard. Google will not accept it' },
  { field: 'Meta primary text', n: 125, allowed: '1 field', past: 'Soft. Likely cut behind See more', soft: true },
  { field: 'Meta headline', n: 40, allowed: '1 field', past: 'Soft. Flagged as a working rule', soft: true },
];
const SCALE_TOTAL = 125;

function Scale({ n }: { n: number }) {
  return (
    <div className="scale" aria-hidden="true" style={{ '--l': n / SCALE_TOTAL }}>
      <RulerArt limit={n} total={SCALE_TOTAL} numbers={false} fill={false} stopAtLimit />
      <i className="g-limit" />
    </div>
  );
}

function WhoGauge({ who }: { who: string }) {
  const limit = 30, total = rulerTotal(limit);
  return (
    <div className="gauge gauge--who" aria-hidden="true" style={{ '--l': limit / total, '--p': graphemes(who).length / total }}>
      <RulerArt limit={limit} total={total} />
      <i className="g-limit" />
      <i className="g-mark" />
    </div>
  );
}

export default function Page() {
  return (
    <>
      <ToolBar />
      <main>
        <section className="bench" aria-labelledby="page-title">
          <div className="wrap bench__grid">
            <h1 id="page-title" className="bench__title">Will this ad fit</h1>
            <Summary />
            <div className="proof">
              <i className="crop crop--tl" aria-hidden="true" /><i className="crop crop--tr" aria-hidden="true" /><i className="crop crop--bl" aria-hidden="true" /><i className="crop crop--br" aria-hidden="true" />
              <Sheet />
            </div>
            <Previews />
          </div>
        </section>

        <section className="why below" aria-labelledby="why-h">
          <div className="wrap">
            <div className="why__intro">
              <h2 id="why-h" data-in>One letter on screen can be stored as several characters</h2>
              <p data-in style={{ '--i': 1 }}>Google Ads stops a headline at 30 characters, and on Meta long primary text is often cut behind a See more link. You usually find out after pasting the copy into the ad platform. A plain character counter is little help with Bangla.</p>
            </div>
            <WorkedExample />
          </div>
        </section>

        <section className="limits below" aria-labelledby="limits-h">
          <div className="wrap">
            <h2 id="limits-h" data-in>Google says no.<br />Meta says See more</h2>

            <div className="limits__kinds">
              <div data-in style={{ '--i': 1 }}>
                <i className="kind-rule" aria-hidden="true" />
                <h3>Hard limit</h3>
                <p>Up to 15 headlines of 30 characters, 4 descriptions of 90, and two display paths of 15 each. These are the hard limits Google Ads applies, and Google will not accept a longer line.</p>
              </div>
              <div data-in style={{ '--i': 2 }}>
                <i className="kind-rule kind-rule--soft" aria-hidden="true" />
                <h3>Soft limit</h3>
                <p>Meta accepts longer text, so treat these as working rules for what stays visible. Primary text is flagged past 125 characters, where many placements cut it with See more, and headlines past 40.</p>
              </div>
            </div>

            <div className="tbl" data-in>
              <table>
                <caption className="sr-only">Character limits per ad field</caption>
                <thead>
                  <tr><th scope="col">Field</th><th scope="col">Limit</th><th scope="col"><span className="sr-only">Drawn to scale</span></th><th scope="col">Allowed</th><th scope="col">Past the limit</th></tr>
                </thead>
                <tbody>
                  {LIMIT_ROWS.map((r) => (
                    <tr key={r.field} data-soft={r.soft ? '' : undefined}>
                      <th scope="row">{r.field}</th>
                      <td className="tbl__n">{r.n}</td>
                      <td className="tbl__g"><Scale n={r.n} /></td>
                      <td>{r.allowed}</td>
                      <td>{r.past}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="limits__hood">Counting is live, per field, by grapheme. It runs in your browser, and nothing is saved or sent anywhere.</p>
          </div>
        </section>

        <section className="desks below" aria-labelledby="desks-h">
          <div className="wrap">
            <h2 id="desks-h" data-in>Set for two desks</h2>

            <div className="desk" data-in>
              <h3>Copywriters</h3>
              <p>Write Bangla or English ad lines that fit before they go to the media buyer.</p>
              <WhoGauge who="Copywriters" />
            </div>
            <div className="desk desk--r" data-in>
              <h3>Media buyers</h3>
              <p>Check a batch of headlines before uploading, so none is rejected for length.</p>
              <WhoGauge who="Media buyers" />
            </div>

            <p className="desks__how">Paste each line into the field it belongs to, watch the count, trim anything amber or past the rule, then paste the finished lines into Google Ads or Meta Ads Manager.</p>
          </div>
        </section>
      </main>
      <ToolFoot />
    </>
  );
}
