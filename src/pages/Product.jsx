import { useState } from 'react';
import { Button, Breadcrumbs, Card } from '@heroui/react';
import { Gallery } from '../components/Gallery';
import { ProductDetail } from '../components/ProductDetail';
import { Garment } from '../lib/garments';
import { money, price } from '../lib/format';
import { useSelection, cartItem } from '../lib/useSelection';
import { useContent } from '../lib/content';
import { useCart, DELIVERY } from '../lib/cart';
import { href } from '../lib/router';

const wrap = 'mx-auto max-w-[1280px] px-[clamp(1.15rem,4vw,3.25rem)]';

export function Product({ code, onAdded }) {
  const { findProduct, products, editions, isEdition, colorway } = useContent();
  const found = code ? findProduct(code) : null;
  /* القطعة المخفيّة من اللوحة لا تُباع: صفحتها تعرض الحالة نفسها كالرابط المجهول. */
  const product = found && !found.hidden ? found : null;
  const [sel, set] = useSelection(product);
  const [msg, setMsg] = useState('');
  const cart = useCart();

  /* رابط بلا كود أو بكود مجهول لا يترك صفحة بيضاء. */
  if (!product) {
    return (
      <div className={wrap + ' py-24 text-center'}>
        <h1 className="text-3xl">لم نجد هذه القطعة</h1>
        <p className="mb-8 mt-3 text-ink-soft">الرابط لا يشير إلى منتج في الكتالوج.</p>
        <Button onPress={() => (location.hash = '/#collection')}>تصفّح المجموعة</Button>
      </div>
    );
  }

  const edition = isEdition(product.code);
  const pool = (edition ? editions : products).filter(x => x.code !== product.code).slice(0, 4);

  const add = () => {
    if (!sel.size) { setMsg('اختر المقاس قبل الإضافة.'); return; }
    cart.add(cartItem(product, sel));
    setMsg('');
    onAdded?.();
  };

  return (
    <>
      <div className={wrap}>
        <Breadcrumbs className="border-b border-[var(--border)] py-4 font-mono text-sm [&_a]:inline-block [&_a]:py-1.5">
          <Breadcrumbs.Item href={href('/')}>الرئيسية</Breadcrumbs.Item>
          <Breadcrumbs.Item href={href(edition ? '/#editions' : '/#collection')}>
            {edition ? 'الإصدارات الخاصة' : 'المجموعة'}
          </Breadcrumbs.Item>
          <Breadcrumbs.Item>{product.name}</Breadcrumbs.Item>
        </Breadcrumbs>
      </div>

      <section className={wrap + ' grid items-start gap-[clamp(1.6rem,4vw,3.4rem)] py-[clamp(1.6rem,4vw,3rem)] lg:grid-cols-2'}>
        <div className="lg:sticky lg:top-24">
          <Gallery product={product} fit={sel.fit} colorKey={sel.color}
                   view={sel.view} onView={v => set({ view: v })} tall />
        </div>

        <div>
          <div className="mb-4 font-mono text-sm text-marker">
            {edition ? `إصدار محدود · ${product.run}` : `ورقة المواصفات · ${product.code}`}
          </div>
          <h1 className="mb-2 text-[clamp(1.9rem,1.6rem+1.5vw,3rem)]">{product.name}</h1>
          <p className="mb-6 border-b border-[var(--border)] pb-5 font-mono text-3xl font-semibold tnum">
            {price(product.price)}
          </p>

          <ProductDetail product={product} sel={sel} set={s => { set(s); setMsg(''); }} />

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-6">
            {msg && <p role="status" className="w-full m-0 font-mono text-sm text-marker">{msg}</p>}
            <Button size="lg" className="min-w-[180px] flex-1" onPress={add}>أضف إلى السلة</Button>
            <Button size="lg" variant="outline" onPress={() => (location.hash = '/checkout')}>عرض السلة</Button>
          </div>

          <dl className="mt-6 border-t border-[var(--border)]">
            {[['التوصيل داخل بغداد', price(DELIVERY.baghdad)],
              ['بقيّة المحافظات', price(DELIVERY.other)],
              ['الدفع', 'عند الاستلام']].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-[var(--border)] py-3">
                <dt className="text-sm text-ink-soft">{k}</dt>
                <dd className="m-0 text-sm font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t border-[var(--border)] py-[clamp(3rem,7vw,5rem)]">
        <div className={wrap}>
          <h2 className="mb-6 text-[clamp(1.45rem,1.3rem+.7vw,2rem)]">
            {edition ? 'إصدارات أخرى' : 'قطع تُلبس معها'}
          </h2>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
            {pool.map(x => (
              <Card key={x.code} className="flex flex-col rounded-none border border-[var(--border)] bg-paper p-4 shadow-none">
                <a href={href(`/product/${x.code}`)} aria-label={x.name}
                   className="mb-3 block bg-paper-2 p-3 [&_svg]:block [&_svg]:h-auto [&_svg]:w-full">
                  <Garment type={x.type} color={colorway(x.colors ? x.colors[0] : x.color)}
                    opts={{ accent: x.accentColor, pattern: x.pattern,
                            embroidery: x.embroidery, reflective: x.reflective }} />
                </a>
                <h3 className="text-lg">
                  <a href={href(`/product/${x.code}`)} className="no-underline hover:text-marker hover:underline">{x.name}</a>
                </h3>
                <span className="mt-auto pt-3 font-mono font-semibold tnum">{money(x.price)} <span className="text-sm font-normal text-ink-soft">د.ع</span></span>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
