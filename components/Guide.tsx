import type { Faq } from './Shell';
import { company, links, service } from '@/lib/site';

/** Shown on the page and in the FAQPage structured data, so the two always match. Limits follow components/store.ts. */
export const FAQ: readonly Faq[] = [
  {
    q: 'What are the character limits for Google responsive search ads?',
    a: 'Google Ads accepts up to 15 headlines of 30 characters each, up to 4 descriptions of 90 characters each, and two display paths of 15 characters each. These are hard limits, and Google will not accept a longer line. The checker starts with 3 headlines and 2 descriptions, lets you add more up to those maximums, and counts each line as you type.',
  },
  {
    q: 'What are the character limits for Meta ads on Facebook and Instagram?',
    a: 'Meta accepts longer text, so its numbers are working rules for what stays visible rather than hard limits. Many feed placements cut primary text after about 125 characters behind a See more link, and long headlines get truncated, so the checker flags primary text past 125 characters and headlines past 40, and previews the ad as a feed post.',
  },
  {
    q: 'How does the checker count Bangla text and emoji?',
    a: 'It counts graphemes, the characters a reader sees, instead of the code points a plain character counter adds up. In Bangla a conjunct such as ক্ষ is built from three code points but reads as one letter, and an emoji with a skin tone is several code points as well. The checker counts each of them once, using the browser’s own text segmentation.',
  },
  {
    q: 'What happens when a line is too long?',
    a: 'Each field shows its count against its limit as you type. Once a line reaches 85% of the limit, the count says how many characters are left. Past the limit it says how many characters over the line is, the extra text is struck through in the preview, and the summary at the top lists every field that is too long.',
  },
  {
    q: 'Is the Ad Copy Length Checker free, and is my ad copy saved or sent anywhere?',
    a: `It is free and needs no sign-up. Counting happens in your browser as you type, and your copy is never sent to a server or saved, so it is gone when you reload or close the page. Paste finished lines into Google Ads or Meta Ads Manager before you leave. The checker is published by ${company.name}.`,
  },
];

export function Guide() {
  return (
    <section className="ph-guide below" aria-labelledby="guide-h">
      <div className="wrap ph-guide__grid">
        <div>
          <h2 id="guide-h">How to check ad copy length</h2>
          <ol className="ph-steps">
            <li><p>Choose the Google responsive search ad or the Meta ad tab.</p></li>
            <li><p>Paste or type each line into the field it belongs to, adding headlines and descriptions up to Google’s 15 and 4.</p></li>
            <li><p>Watch the counts and the preview, and trim any line that is close to or past its limit.</p></li>
            <li><p>Paste the finished lines into Google Ads or Meta Ads Manager.</p></li>
          </ol>
        </div>

        <div>
          <h2 id="faq-h">Ad copy questions</h2>
          <div className="ph-faq">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="ph-guide__more">
          This checker is published by <a href={links.home}>{company.name}</a>, which also plans and runs <a href={service('search-ads')}>Google search ad campaigns</a> and <a href={service('social-media-marketing')}>social media marketing on Facebook and Instagram</a>, and does <a href={service('seo')}>search engine optimization</a> for brands writing in Bangla and English.
        </p>
      </div>
    </section>
  );
}
