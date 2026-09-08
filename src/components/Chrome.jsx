import { Button, Separator } from '@heroui/react';
import { money, price } from '../lib/format';
import { useCart, DELIVERY, FREE_OVER } from '../lib/cart';
import { SECTIONS, useContent } from '../lib/content';
import { href } from '../lib/router';

/* الروابط تُشتقّ من الأقسام الظاهرة: إخفاء قسم يجب ألا يترك رابطاً يقود إلى فراغ. */
export function Header({ onCart }) {
  const cart = useCart();
  const content = useContent();
  const NAV = SECTIONS.filter(s => s.nav && content.isVisible(s.id))
                      .map(s => ['/#' + s.id, s.nav]);
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)]
                       bg-[color-mix(in_srgb,var(--color-paper)_88%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-[clamp(1.15rem,4vw,3.25rem)] py-3
                      sm:gap-8">
        <a href={href('/')} dir="ltr"
           className="font-mono text-[1.35rem] font-semibold tracking-tight no-underline">
          <span className="text-ink">vita</span><span className="text-marker font-bold">S</span>
        </a>

        <nav aria-label="الرئيسية" className="me-auto hidden gap-4 md:flex lg:gap-7">
          {NAV.map(([h, label]) => (
            <a key={h} href={href(h)}
               className="border-b-2 border-transparent py-2 text-sm font-medium text-ink-soft
                          no-underline transition hover:border-marker hover:text-ink">
              {label}
            </a>
          ))}
        </nav>

        <div className="ms-auto md:ms-0">
          {/* شارة العدد span عادي: Badge داخل Button يركّب PressResponder بلا طفل قابل للضغط. */}
          <Button size="sm" onPress={onCart} aria-label={`السلة — ${money(cart.count)} قطعة`}
                  className="font-mono">
            السلة
            <span className="ms-2 min-w-[1.6em] bg-marker px-1 text-center text-white tnum">
              {money(cart.count)}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const content = useContent();
  const shopLinks = [
    ['collection', 'المجموعة الأساسية'],
    ['editions', 'الإصدارات الخاصة'],
    ['sizes', 'دليل المقاسات']
  ].filter(([id]) => content.isVisible(id));
  const col = 'grid gap-2 list-none p-0 m-0';
  const link = 'text-sm text-[color-mix(in_srgb,var(--color-paper)_85%,transparent)] no-underline hover:text-paper hover:underline inline-block py-1';
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-[1280px] px-[clamp(1.15rem,4vw,3.25rem)] pb-8 pt-[clamp(2.5rem,6vw,4rem)]">
        <div className="grid gap-8 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
          <div>
            <a href={href('/')} dir="ltr" className="font-mono text-[1.35rem] font-semibold no-underline">
              <span className="text-paper">vita</span><span className="text-[var(--color-marker-lift)] font-bold">S</span>
            </a>
            <p className="mt-3 max-w-[30ch] text-sm leading-relaxed text-[color-mix(in_srgb,var(--color-paper)_70%,transparent)]">
              ألبسة طبية تُصمَّم مع من يلبسها، وتُختبر في المناوبة لا في الاستوديو.
            </p>
          </div>
          <div>
            <h3 className="mb-3 font-mono text-sm text-[color-mix(in_srgb,var(--color-paper)_60%,transparent)]">المتجر</h3>
            <ul className={col}>
              {shopLinks.map(([id, label]) => (
                <li key={id}><a className={link} href={href('/#' + id)}>{label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-mono text-sm text-[color-mix(in_srgb,var(--color-paper)_60%,transparent)]">المساعدة</h3>
            <ul className={col}>
              <li><a className={link} href={href('/checkout')}>السلة وإتمام الطلب</a></li>
              {content.isVisible('fabric') &&
                <li><a className={link} href={href('/#fabric')}>العناية بالقماش</a></li>}
              <li><a className={link} href={href('/admin')}>لوحة التحكّم</a></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-mono text-sm text-[color-mix(in_srgb,var(--color-paper)_60%,transparent)]">التوصيل</h3>
            <ul className={col}>
              <li><span className={link}>بغداد {price(DELIVERY.baghdad)}</span></li>
              <li><span className={link}>بقيّة المحافظات {price(DELIVERY.other)}</span></li>
              <li><span className={link}>مجاني فوق {price(FREE_OVER)}</span></li>
            </ul>
          </div>
        </div>
        <Separator className="my-6 bg-[color-mix(in_srgb,var(--color-paper)_20%,transparent)]" />
        <div className="flex flex-wrap justify-between gap-4 font-mono text-sm
                        text-[color-mix(in_srgb,var(--color-paper)_55%,transparent)]">
          <span>© ٢٠٢٦ vitaS</span>
          <span>عرض توضيحي — لا يُرسَل أي طلب فعلياً</span>
          <span>الصور المدمجة من Freepik بترخيص مجاني — يلزم ذكر المصدر</span>
        </div>
      </div>
    </footer>
  );
}
