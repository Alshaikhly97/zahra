import { Garment } from '../lib/garments';
import { useContent } from '../lib/content';

/* لقطات الموديل تتبع القَصّة؛ ولقطة «القطعة مسطّحة» تتبع اللون المختار
   وهي المرجع اللوني الصحيح لأن التصوير لا يغطّي كل الألوان. */
export function galleryShots(p, fit, photoOf) {
  const keys = (p.models && p.models[fit]) || [];
  /* مفتاح لم يعد في المكتبة يُسقَط بهدوء بدل أن يعرض لقطة فارغة. */
  const shots = keys.map(k => ({ kind: 'photo', ...(photoOf(k) || {}) })).filter(x => x.src);
  shots.push({ kind: 'flat', label: 'القطعة مسطّحة' });
  return shots;
}

export function Gallery({ product, fit, colorKey, view, onView, tall }) {
  const { colorway, photo } = useContent();
  const c = colorway(colorKey);
  const shots = galleryShots(product, fit, photo);
  const idx = view < shots.length ? view : 0;
  const cur = shots[idx];
  const opts = {
    accent: product.accentColor, pattern: product.pattern,
    embroidery: product.embroidery, reflective: product.reflective
  };

  const caption = cur.kind !== 'photo'
    ? `${c.name} — الرسم يتبع اللون المختار`
    : cur.color === c.name
      ? `الصورة باللون ${c.name}`
      : `الصورة باللون ${cur.color} · لون القطعة المختار ${c.name} — يظهر في لقطة «القطعة مسطّحة»`;

  return (
    <div>
      {/* contain لا cover: نسب الصور بين ٠٫٦٧ و ٠٫٨٧ — لا يُقصّ ثوب معروض للبيع. */}
      <div className={'relative overflow-hidden border border-[var(--border)] bg-paper-2 ' +
                      (tall ? 'h-[min(68vh,620px)]' : 'aspect-[3/4]')}>
        {cur.kind === 'photo' ? (
          <img src={cur.src} alt={cur.alt} loading="lazy" decoding="async"
               className="h-full w-full object-contain [filter:saturate(.92)_contrast(1.02)]" />
        ) : (
          <div className="h-full p-4">
            <Garment type={product.type} color={c} opts={opts} fit="box" />
          </div>
        )}
      </div>

      <div role="group" aria-label="لقطات المنتج" className="mt-2 flex flex-wrap gap-2">
        {shots.map((sh, i) => (
          <button key={i} type="button" onClick={() => onView(i)}
            aria-pressed={i === idx}
            aria-label={sh.kind === 'photo' ? sh.alt : sh.label}
            className={'h-[78px] w-[62px] overflow-hidden bg-paper-2 transition ' +
              (i === idx
                ? 'border-2 border-ink outline outline-1 outline-offset-1 outline-marker'
                : 'border border-[var(--border)] hover:-translate-y-0.5')}>
            {sh.kind === 'photo'
              ? <img src={sh.src} alt="" loading="lazy" className="h-full w-full object-cover" />
              : <span className="block h-full p-1">
                  <Garment type={product.type} color={c} opts={opts} fit="box" />
                </span>}
          </button>
        ))}
      </div>

      <p className="mt-3 font-mono text-sm leading-relaxed text-ink-soft">{caption}</p>
    </div>
  );
}
