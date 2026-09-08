import { useRef, useState } from 'react';
import {
  Button, TextField, TextArea, Input, Label, Description, FieldError,
  Select, ListBox, RadioGroup, Radio, Breadcrumbs
} from '@heroui/react';
import { CartLine } from '../components/CartDrawer';
import { money, price } from '../lib/format';
import { useCart, GOVERNORATES, shipping, FREE_OVER } from '../lib/cart';
import { href } from '../lib/router';

const wrap = 'mx-auto max-w-[1280px] px-[clamp(1.15rem,4vw,3.25rem)]';
const ORDERS_KEY = 'vitas.orders.v1';

/* لكل حقل شرط ورسالة تقول ما الناقص تحديداً. */
const RULES = {
  name: [v => v.trim().length >= 3, 'اكتب الاسم الكامل (ثلاثة أحرف على الأقل).'],
  phone: [v => /^07\d{9}$/.test(v.replace(/[\s-]/g, '')),
          'رقم غير مكتمل. الصيغة أحد عشر رقماً تبدأ بـ ٠٧، مثل 07701234567.'],
  gov: [v => !!v, 'اختر المحافظة من القائمة.'],
  city: [v => v.trim().length >= 2, 'اكتب المدينة أو المنطقة.'],
  landmark: [v => v.trim().length >= 3, 'اكتب أقرب نقطة دالّة — المندوب يصل بها.'],
  address: [v => v.trim().length >= 6, 'اكتب تفاصيل العنوان: الحي والزقاق ورقم الدار.']
};

const orderNumber = () => {
  const d = new Date(), p = n => String(n).padStart(2, '0');
  return `VS-${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${Math.floor(1000 + Math.random() * 9000)}`;
};

/* Field خارج Checkout عمداً: تعريف مكوّن داخل دالة العرض يعيد تركيبه
   مع كل ضغطة مفتاح، فيفقد الحقل التركيز بعد كل حرف. */
function Field({ name, label, hint, type = 'text', placeholder, area, value, error, onChange, onBlur }) {
  return (
    <TextField className="mb-6 w-full" name={name} type={area ? undefined : type}
               isInvalid={!!error} value={value} onChange={onChange}>
      <Label>{label}</Label>
      {area
        ? <TextArea rows={3} placeholder={placeholder} onBlur={onBlur} className="min-h-24" />
        : <Input placeholder={placeholder}
                 inputMode={type === 'tel' ? 'numeric' : undefined} onBlur={onBlur} />}
      {hint && <Description>{hint}</Description>}
      <FieldError>{error}</FieldError>
    </TextField>
  );
}

export function Checkout() {
  const cart = useCart();
  const [f, setF] = useState({ name: '', phone: '', gov: '', city: '', landmark: '', address: '', notes: '' });
  const [errs, setErrs] = useState({});
  const [banner, setBanner] = useState('');
  const [done, setDone] = useState(null);
  const formRef = useRef(null);

  const upd = (k, v) => {
    setF(s => ({ ...s, [k]: v }));
    if (errs[k] && RULES[k][0](v)) setErrs(e => ({ ...e, [k]: null }));
  };

  const blur = k => { if (RULES[k] && f[k].trim()) setErrs(e => ({ ...e, [k]: RULES[k][0](f[k]) ? null : RULES[k][1] })); };

  const submit = () => {
    const next = {};
    let first = null;
    Object.keys(RULES).forEach(k => {
      if (!RULES[k][0](f[k])) { next[k] = RULES[k][1]; if (!first) first = k; }
    });
    setErrs(next);
    if (first) {
      setBanner('الطلب لم يُرسَل: أكمل الحقول المعلَّمة بالأحمر.');
      const el = first === 'gov'
        ? formRef.current?.querySelector('button[data-slot="trigger"], [role="button"]')
        : formRef.current?.querySelector(`[name="${first}"]`);
      el?.focus();
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    setBanner('');

    const sub = cart.subtotal, ship = shipping(f.gov, sub), num = orderNumber();
    const order = {
      number: num, at: new Date().toISOString(),
      customer: { ...f, phone: f.phone.replace(/[\s-]/g, '') },
      items: cart.items, subtotal: sub, shipping: ship, total: sub + ship,
      payment: 'الدفع عند الاستلام'
    };
    /* حفظ محلي فقط — لا شبكة ولا طرف ثالث. */
    try {
      const prev = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
      localStorage.setItem(ORDERS_KEY, JSON.stringify([...prev, order]));
    } catch { /* التخزين غير متاح: التأكيد يُعرض على أي حال */ }

    setDone(order);
    cart.clear();
    scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (done) {
    return (
      <div className={wrap + ' mx-auto max-w-[60ch] py-[clamp(2.5rem,7vw,5rem)] text-center'}>
        <div className="mb-4 font-mono text-sm tracking-widest text-marker">تم الاستلام</div>
        <h1 className="mb-2 text-[clamp(1.9rem,1.6rem+1.5vw,3rem)]">سجّلنا طلبك</h1>
        <p className="mb-6 font-mono text-xl text-marker">رقم الطلب {done.number}</p>
        <p className="mb-8 leading-relaxed text-ink-soft">
          هذا <strong>عرض توضيحي</strong>: لم يُرسَل الطلب إلى أي جهة ولم تغادر بياناتك المتصفّح.
          في المتجر الفعلي يصل هنا اتصال من المندوب لتأكيد الموعد.
        </p>
        <dl className="mb-8 text-start">
          {[['المستلِم', done.customer.name],
            ['الهاتف', <span dir="ltr" key="p">{done.customer.phone}</span>],
            ['العنوان', `${done.customer.gov} — ${done.customer.city}، ${done.customer.landmark}`],
            ['التوصيل', done.shipping === 0 ? 'مجاني' : price(done.shipping)],
            ['الإجمالي', price(done.total)]].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-[var(--border)] py-3">
              <dt className="text-sm text-ink-soft">{k}</dt><dd className="m-0 text-sm font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <Button onPress={() => (location.hash = '/')}>العودة إلى المتجر</Button>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className={wrap + ' py-24 text-center'}>
        <h1 className="text-3xl">السلة فارغة</h1>
        <p className="mb-8 mt-3 text-ink-soft">أضف قطعة واحدة على الأقل قبل إتمام الطلب.</p>
        <Button onPress={() => (location.hash = '/#collection')}>تصفّح المجموعة</Button>
      </div>
    );
  }

  const sub = cart.subtotal;
  const ship = shipping(f.gov, sub);

  return (
    <>
      <div className={wrap}>
        <Breadcrumbs className="border-b border-[var(--border)] py-4 font-mono text-sm [&_a]:inline-block [&_a]:py-1.5">
          <Breadcrumbs.Item href={href('/')}>الرئيسية</Breadcrumbs.Item>
          <Breadcrumbs.Item>إتمام الطلب</Breadcrumbs.Item>
        </Breadcrumbs>
      </div>

      <section className={wrap + ' grid items-start gap-[clamp(1.6rem,4vw,3rem)] py-[clamp(1.6rem,4vw,2.6rem)] pb-20 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]'}>
        <div>
          <div className="mb-8">
            <div className="mb-3 font-mono text-sm tracking-widest text-marker">عنوان التوصيل</div>
            <h1 className="text-[clamp(1.9rem,1.6rem+1.5vw,3rem)]">إلى أين نوصّل الطلب؟</h1>
          </div>

          {/* role="alert" يجعل قارئ الشاشة يعلن الرسالة فور ظهورها */}
          <div role="alert" aria-live="assertive" className={banner ? 'mb-6 border-s-4 border-marker bg-[color-mix(in_srgb,#A63527_12%,var(--color-paper))] px-4 py-3 font-medium' : 'sr-only'}>
            {banner}
          </div>

          <form ref={formRef} noValidate onSubmit={e => { e.preventDefault(); submit(); }}>
            <Field name="name" label="الاسم الكامل"
                   value={f.name} error={errs.name}
                   onChange={v => upd('name', v)} onBlur={() => blur('name')} />
            <Field name="phone" label="رقم الهاتف" type="tel" placeholder="07XXXXXXXXX"
                   hint="أحد عشر رقماً تبدأ بـ ٠٧ — يتصل المندوب عليه قبل التسليم."
                   value={f.phone} error={errs.phone}
                   onChange={v => upd('phone', v)} onBlur={() => blur('phone')} />

            {/* Select في HeroUI يمرّر isInvalid إلى عنصر DOM فيطلق تحذير React —
                نعتمد FieldError وحده، وهو ما يربط الرسالة بالحقل على أي حال. */}
            <Select className="mb-6 w-full" name="gov" placeholder="اختر المحافظة"
                    aria-describedby={errs.gov ? 'err-gov' : undefined}
                    selectedKey={f.gov || null}
                    onSelectionChange={k => upd('gov', k ? String(k) : '')}>
              <Label>المحافظة</Label>
              <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {GOVERNORATES.map(g => (
                    <ListBox.Item key={g} id={g} textValue={g}>
                      {g}<ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
            {/* رسالة المحافظة تُعرض يدوياً لأن FieldError لا يظهر بلا isInvalid */}
            {errs.gov && (
              <p id="err-gov" className="-mt-4 mb-6 text-sm font-medium text-marker">{errs.gov}</p>
            )}

            <Field name="city" label="المدينة أو المنطقة"
                   value={f.city} error={errs.city}
                   onChange={v => upd('city', v)} onBlur={() => blur('city')} />
            <Field name="landmark" label="أقرب نقطة دالّة" placeholder="مثال: مقابل صيدلية النور"
                   hint="المندوب يصل بالنقطة الدالّة قبل اسم الشارع — لا تتركها فارغة."
                   value={f.landmark} error={errs.landmark}
                   onChange={v => upd('landmark', v)} onBlur={() => blur('landmark')} />
            <Field name="address" label="تفاصيل العنوان" area
                   value={f.address} error={errs.address}
                   onChange={v => upd('address', v)} onBlur={() => blur('address')} />
            <Field name="notes" label="ملاحظات للمندوب (اختياري)" area
                   value={f.notes} error={errs.notes}
                   onChange={v => upd('notes', v)} onBlur={() => blur('notes')} />

            <RadioGroup defaultValue="cod" name="pay" className="mb-6">
              <Label>طريقة الدفع</Label>
              {/* منطقة نقر لا تقلّ عن ٤٤ بكسل: الزرّ الأصلي ١٣ بكسل وحده */}
              <Radio value="cod" className="min-h-11">
                <Radio.Content className="min-h-11 items-center gap-3">
                  <Radio.Control className="size-6"><Radio.Indicator /></Radio.Control>
                  الدفع عند الاستلام نقداً
                </Radio.Content>
              </Radio>
              <Description>الدفع الإلكتروني غير مفعّل في هذا العرض التوضيحي.</Description>
            </RadioGroup>
          </form>
        </div>

        <aside aria-labelledby="sum-title"
               className="border border-[color-mix(in_srgb,#17241F_26%,transparent)] bg-paper-2 p-[clamp(1.1rem,3vw,1.6rem)] lg:sticky lg:top-24">
          <h2 id="sum-title" className="mb-4 text-xl">ملخّص الطلب</h2>
          {cart.items.map(i => <CartLine key={i.key} item={i} />)}

          <dl className="mt-4">
            <div className="flex justify-between gap-4 border-b border-[var(--border)] py-3">
              <dt className="text-sm text-ink-soft">مجموع القطع</dt>
              <dd className="m-0 text-sm font-medium tnum">{price(sub)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-[var(--border)] py-3">
              <dt className="text-sm text-ink-soft">التوصيل</dt>
              <dd className="m-0 text-sm font-medium tnum">
                {!f.gov ? 'يُحسب بعد اختيار المحافظة' : ship === 0 ? 'مجاني' : price(ship)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="font-semibold">الإجمالي</dt>
              <dd className="m-0 font-mono text-xl font-semibold tnum">{price(sub + (ship || 0))}</dd>
            </div>
          </dl>

          <Button className="w-full" onPress={submit}>تأكيد الطلب</Button>
          <p className="mt-3 text-sm text-ink-soft">توصيل مجاني للطلبات فوق {price(FREE_OVER)}.</p>
        </aside>
      </section>
    </>
  );
}
