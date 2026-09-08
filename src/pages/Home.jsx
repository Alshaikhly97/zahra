import { useState } from 'react';
import { Button, Card, Chip } from '@heroui/react';
import { CALLOUTS } from '../data/catalog';
import { Garment, garmentHTML } from '../lib/garments';
import { money, price, pockets, pad2 } from '../lib/format';
import { href } from '../lib/router';
import { QuickView } from '../components/QuickView';
import { useContent } from '../lib/content';

const wrap = 'mx-auto max-w-[1280px] px-[clamp(1.15rem,4vw,3.25rem)]';

function Eyebrow({ children, light }) {
  return (
    <div className={'mb-5 flex items-center gap-3 font-mono text-sm tracking-widest ' +
                    (light ? 'text-paper' : 'text-marker')}>
      {children}
      <span aria-hidden="true"
            className="h-px flex-1 opacity-55"
            style={{ background: `repeating-linear-gradient(to left, ${light ? '#E6E2D7' : '#275E75'} 0 6px, transparent 6px 11px)` }} />
    </div>
  );
}

/* ============ المخطّط الفني التفاعلي — العنصر المميّز في الصفحة ============ */
function Schematic() {
  const { colorway } = useContent();
  const [active, setActive] = useState(null);
  const k = CALLOUTS.find(x => x.n === active);

  return (
    <div className="relative border border-[color-mix(in_srgb,#17241F_30%,transparent)] bg-paper-2 p-[clamp(1rem,3vw,2rem)]">
      <span aria-hidden="true"
            className="pointer-events-none absolute inset-2 border border-dashed border-[color-mix(in_srgb,#275E75_40%,transparent)]" />
      <div className="mb-2 flex justify-between gap-4 border-b border-[var(--border)] pb-3 font-mono text-sm text-ink-soft">
        <span>مخطّط فني — قميص سكراب</span><span>مقياس ١:٤</span>
      </div>

      <div className="relative [&_svg]:block [&_svg]:h-auto [&_svg]:w-full">
        <span dangerouslySetInnerHTML={{ __html: garmentHTML('top', colorway('surgical'), { big: true }) }} />
        {CALLOUTS.map(c => (
          <button key={c.n} type="button"
            /* إحداثيات فيزيائية مقصودة: النقاط فوق رسم SVG ثابت لا يُعكس مع الاتجاه */
            style={{ left: c.x + '%', top: c.y + '%' }}
            className={'absolute grid h-[30px] w-[30px] -translate-x-1/2 -translate-y-1/2 place-items-center ' +
              'rounded-full border-[1.5px] font-mono text-xs font-semibold transition ' +
              (active === c.n
                ? 'scale-110 border-marker bg-marker text-white'
                : 'border-ink bg-paper text-ink hover:scale-110 hover:border-marker hover:bg-marker hover:text-white')}
            aria-expanded={active === c.n} aria-controls="callout-note"
            onMouseEnter={() => setActive(c.n)} onFocus={() => setActive(c.n)}
            onClick={() => setActive(c.n)}>
            <span aria-hidden="true">{money(c.n)}</span>
            <span className="sr-only">{c.title}</span>
          </button>
        ))}
      </div>

      <div id="callout-note" className="mt-4 min-h-[5.6rem] border-t-2 border-marker pt-3">
        <span className="mb-1 block font-mono text-sm text-marker">
          {k ? `${pad2(k.n)} — تفصيل` : '٠٠ — تفصيل'}
        </span>
        <h3 className="text-xl">{k ? k.title : 'سبع نقاط تصنع الفرق'}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          {k ? k.body : 'مرّر على أي رقم على المخطّط لتقرأ سبب وجوده.'}
        </p>
      </div>
    </div>
  );
}

/* ============ بطاقة المنتج — محايدة الجنس عمداً ============ */
function ProductCard({ p, onQuick }) {
  const { colorway } = useContent();
  /* منتج بلا ألوان يسقط على p.colors[0] — الحارس هنا لا في اللوحة وحدها. */
  const [colorKey, setColorKey] = useState((p.colors && p.colors[0]) || 'surgical');
  return (
    <Card className="flex h-full flex-col rounded-none border-0 bg-paper p-5 shadow-none transition hover:bg-paper-2">
      <div className="mb-2 flex justify-between font-mono text-sm text-ink-soft">
        <span className="tracking-wider">{p.code}</span><span>{money(p.gsm)} غ/م²</span>
      </div>
      <a href={href(`/product/${p.code}`)} aria-label={`الصفحة الكاملة — ${p.name}`}
         className="mb-4 block border border-dashed border-[var(--border)] bg-paper-2 p-3
                    [&_svg]:block [&_svg]:h-auto [&_svg]:w-full">
        <Garment type={p.type} color={colorway(colorKey)} />
      </a>
      <h3 className="text-xl">
        <a href={href(`/product/${p.code}`)} className="no-underline hover:text-marker hover:underline">{p.name}</a>
      </h3>
      <p className="mb-4 mt-1 text-sm leading-relaxed text-ink-soft">{p.tagline}</p>

      <div className="mb-4 flex flex-wrap gap-2 border-t border-[var(--border)] pt-3">
        <Chip size="sm" variant="secondary" className="font-mono">{pockets(p.pockets)}</Chip>
        <Chip size="sm" variant="secondary" className="font-mono">مطاطية {p.stretch}</Chip>
      </div>

      <div role="group" aria-label={`ألوان ${p.name}`} className="mb-4 flex flex-wrap gap-2">
        {(p.colors || []).map(key => (
          <button key={key} type="button" title={colorway(key).name} aria-label={colorway(key).name}
            aria-pressed={key === colorKey} onClick={() => setColorKey(key)}
            style={{ background: colorway(key).hex }}
            className={'h-[26px] w-[26px] rounded-full transition hover:scale-110 ' +
              (key === colorKey
                ? 'border-2 border-ink ring-2 ring-ink ring-offset-2 ring-offset-paper'
                : 'border-[1.5px] border-[color-mix(in_srgb,#17241F_28%,transparent)]')} />
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
        <span className="font-mono text-xl font-semibold tnum">
          {money(p.price)} <span className="text-sm font-normal text-ink-soft">د.ع</span>
        </span>
        <Button size="sm" onPress={() => onQuick(p.code)}>معاينة سريعة</Button>
      </div>
    </Card>
  );
}

function EditionCard({ e, onQuick }) {
  const { colorway } = useContent();
  const c = colorway(e.color);
  return (
    <article style={{ '--ed-accent': e.accentColor }}
      className="flex flex-col border border-[color-mix(in_srgb,#E6E2D7_24%,transparent)] p-6 transition
                 hover:-translate-y-1 hover:border-[color-mix(in_srgb,#E6E2D7_55%,transparent)]">
      <div className="mb-4 flex justify-between border-b border-[color-mix(in_srgb,#E6E2D7_22%,transparent)] pb-2
                      font-mono text-sm text-[color-mix(in_srgb,#E6E2D7_62%,transparent)]">
        <span className="tracking-wider">{e.code}</span>
        <b style={{ color: e.accentColor }}>{e.run}</b>
      </div>
      <a href={href(`/product/${e.code}`)} aria-label={`الصفحة الكاملة — ${e.name}`}
         className="block py-3 [&_svg]:block [&_svg]:max-h-[210px] [&_svg]:w-full">
        <Garment type={e.type} color={c}
          opts={{ accent: e.accentColor, pattern: e.pattern, embroidery: e.embroidery, reflective: e.reflective }} />
      </a>
      <h3 className="text-2xl text-paper">
        <a href={href(`/product/${e.code}`)} className="no-underline hover:underline">{e.name}</a>
      </h3>
      <div className="mb-3 mt-2 font-mono text-sm" style={{ color: e.accentColor }}>{e.unit}</div>
      <p className="mb-6 text-sm leading-relaxed text-[color-mix(in_srgb,#E6E2D7_72%,transparent)]">{e.story}</p>
      <div className="mt-auto flex items-center justify-between gap-3
                      border-t border-[color-mix(in_srgb,#E6E2D7_22%,transparent)] pt-4">
        <span className="font-mono text-xl font-semibold text-paper tnum">
          {money(e.price)} <span className="text-sm font-normal text-[color-mix(in_srgb,#E6E2D7_60%,transparent)]">د.ع</span>
        </span>
        <Button size="sm" variant="secondary" onPress={() => onQuick(e.code)}>معاينة سريعة</Button>
      </div>
    </article>
  );
}



export function Home({ onAdded, inert }) {
  const [quick, setQuick] = useState(null);
  const { t, isVisible, products, editions, sizeRows, fabricRows } = useContent();

  return (
    <>
      {isVisible('hero') && (
      <section id="hero" className="scroll-mt-24 border-b border-[var(--border)] py-[clamp(2rem,6vw,4.5rem)]">
        <div className={wrap + ' grid items-center gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-2'}>
          <div>
            <Eyebrow>{t('hero.eyebrow')}</Eyebrow>
            <h1 className="mb-4 text-[clamp(2.6rem,1.9rem+3.4vw,5.4rem)] tracking-tight">
              {t('hero.title.a')}{' '}
              <em className="not-italic text-marker [box-decoration-break:clone]
                [background:linear-gradient(color-mix(in_srgb,#A63527_26%,transparent)_0_0)_no-repeat_0_92%/100%_0.12em]">{t('hero.title.em')}</em>،{' '}
              {t('hero.title.b')}
            </h1>
            <p className="mb-8 max-w-[44ch] text-xl leading-relaxed text-ink-soft">
              {t('hero.lede')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onPress={() => (location.hash = '/#collection')}>{t('hero.cta1')}</Button>
              <Button size="lg" variant="outline" onPress={() => (location.hash = '/#editions')}>{t('hero.cta2')}</Button>
            </div>
            <div className="mt-8 flex flex-wrap border-t border-[var(--border)]">
              {[[t('hero.stat1.v'),t('hero.stat1.l')],[t('hero.stat2.v'),t('hero.stat2.l')],[t('hero.stat3.v'),t('hero.stat3.l')]].map(([v,l],i,a) => (
                <div key={l} className={'py-4 pe-6 ' + (i < a.length-1 ? 'me-6 border-e border-[var(--border)]' : '')}>
                  <b className="block font-mono text-3xl font-semibold tnum">{v}</b>
                  <span className="text-sm text-ink-soft">{l}</span>
                </div>
              ))}
            </div>
          </div>
          <Schematic />
        </div>
      </section>
      )}

      {isVisible('collection') && (
      <section id="collection" className="scroll-mt-24 border-b border-[var(--border)] py-[clamp(3rem,8vw,6rem)]">
        <div className={wrap}>
          <div className="mb-[clamp(1.8rem,4vw,3rem)]">
            <Eyebrow>{t('collection.eyebrow')}</Eyebrow>
            <h2 className="text-[clamp(1.9rem,1.6rem+1.5vw,3rem)]">{t('collection.title')}</h2>
            <p className="mt-3 max-w-[58ch] text-ink-soft">
              {t('collection.body')}
            </p>
          </div>
          <div className="grid border-s border-t border-[var(--border)]
                          [grid-template-columns:repeat(auto-fill,minmax(272px,1fr))]
                          [&>*]:border-b [&>*]:border-e [&>*]:border-[var(--border)]">
            {products.map(p => <ProductCard key={p.code} p={p} onQuick={setQuick} />)}
          </div>
        </div>
      </section>
      )}

      {isVisible('editions') && (
      <section id="editions" className="scroll-mt-24 bg-ink py-[clamp(3rem,8vw,6rem)] text-paper">
        <div className={wrap}>
          <div className="mb-[clamp(1.8rem,4vw,3rem)]">
            <Eyebrow light>{t('editions.eyebrow')}</Eyebrow>
            <h2 className="text-[clamp(1.9rem,1.6rem+1.5vw,3rem)] text-paper">{t('editions.title')}</h2>
            <p className="mt-3 max-w-[58ch] text-[color-mix(in_srgb,#E6E2D7_62%,transparent)]">
              {t('editions.body')}
            </p>
          </div>
          <div className="grid gap-[clamp(1rem,2vw,1.4rem)] [grid-template-columns:repeat(auto-fit,minmax(246px,1fr))]">
            {editions.map(e => <EditionCard key={e.code} e={e} onQuick={setQuick} />)}
          </div>
        </div>
      </section>
      )}

      {isVisible('fabric') && (
      <section id="fabric" className="scroll-mt-24 border-b border-[var(--border)] py-[clamp(3rem,8vw,6rem)]">
        <div className={wrap}>
          <div className="mb-[clamp(1.8rem,4vw,3rem)]">
            <Eyebrow>{t('fabric.eyebrow')}</Eyebrow>
            <h2 className="text-[clamp(1.9rem,1.6rem+1.5vw,3rem)]">{t('fabric.title')}</h2>
          </div>
          <div className="grid [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
            {fabricRows.map(([code, title, body], i, a) => (
              <div key={title} className={'py-6 pe-6 ' + (i < a.length-1 ? 'border-e border-[var(--border)]' : '')}>
                <span className="mb-3 block font-mono text-sm text-blueprint">{code}</span>
                <h3 className="mb-2 text-xl">{title}</h3>
                <p className="text-sm leading-relaxed text-ink-soft">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {isVisible('sizes') && (
      <section id="sizes" className="scroll-mt-24 py-[clamp(3rem,8vw,6rem)]">
        <div className={wrap}>
          <div className="mb-[clamp(1.8rem,4vw,3rem)]">
            <Eyebrow>{t('sizes.eyebrow')}</Eyebrow>
            <h2 className="text-[clamp(1.9rem,1.6rem+1.5vw,3rem)]">{t('sizes.title')}</h2>
            <p className="mt-3 max-w-[58ch] text-ink-soft">
              {t('sizes.body')}
            </p>
          </div>
          <div className="overflow-x-auto border border-[var(--border)]">
            <table className="w-full min-w-[620px] border-collapse font-mono text-sm tnum">
              <caption className="border-b border-[var(--border)] p-4 text-start font-sans text-ink-soft">
                جدول المقاسات — قياسات الجسم بالسنتيمتر
              </caption>
              <thead>
                <tr className="bg-paper-2">
                  {['المقاس','الصدر','الخصر','الورك','طول الظهر'].map(h => (
                    <th key={h} scope="col" className="border-b border-[var(--border)] p-3 text-start font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sizeRows.map(([s,...cells]) => (
                  <tr key={s} className="hover:bg-paper-2">
                    <th scope="row" className="border-b border-[var(--border)] p-3 text-start font-semibold text-marker">{s}</th>
                    {cells.map((c,i) => <td key={i} className="border-b border-[var(--border)] p-3 text-start">{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      )}

      {/* key يضمن تركيباً نظيفاً لكل منتج بدل حمل حالة السابق */}
      {!inert && quick && <QuickView key={quick} code={quick} onClose={() => setQuick(null)} onAdded={onAdded} />}
    </>
  );
}
