/* vitaS — إتمام الطلب: مراجعة السلة، عنوان التوصيل، والتأكيد.
   لا يغادر أي شيء المتصفّح: الطلب يُحفظ محلياً فقط. */

const ORDERS_KEY = 'vitas.orders.v1';

/* قواعد التحقّق: لكل حقل شرط ورسالة تقول ما الناقص تحديداً. */
const RULES = [
  ['f-name', v => v.trim().length >= 3, 'اكتب الاسم الكامل (ثلاثة أحرف على الأقل).'],
  ['f-phone', v => /^07\d{9}$/.test(v.replace(/[\s-]/g, '')),
   'رقم غير مكتمل. الصيغة أحد عشر رقماً تبدأ بـ ٠٧، مثل 07701234567.'],
  ['f-gov', v => !!v, 'اختر المحافظة من القائمة.'],
  ['f-city', v => v.trim().length >= 2, 'اكتب المدينة أو المنطقة.'],
  ['f-landmark', v => v.trim().length >= 3, 'اكتب أقرب نقطة دالّة — المندوب يصل بها.'],
  ['f-address', v => v.trim().length >= 6, 'اكتب تفاصيل العنوان: الحي والزقاق ورقم الدار.']
];

function fieldError(id, msg) {
  const input = $('#' + id);
  const err = $('#e-' + id.slice(2));
  if (msg) {
    input.setAttribute('aria-invalid', 'true');
    err.textContent = msg;
  } else {
    input.removeAttribute('aria-invalid');
    err.textContent = '';
  }
}

function validate(report) {
  let firstBad = null;
  RULES.forEach(([id, ok, msg]) => {
    const val = $('#' + id).value;
    const good = ok(val);
    if (report) fieldError(id, good ? '' : msg);
    if (!good && !firstBad) firstBad = id;
  });
  return firstBad;
}

/* ---------- المجاميع ---------- */

function refreshTotals() {
  const sub = Cart.subtotal();
  const gov = $('#f-gov').value;
  const ship = shipping(gov, sub);

  $('#sum-sub').textContent = price(sub);
  $('#sum-ship').textContent = gov === ''
    ? 'يُحسب بعد اختيار المحافظة'
    : ship === 0 ? 'مجاني' : price(ship);
  $('#sum-total').textContent = price(sub + (ship || 0));
}

function showState() {
  const has = Cart.items.length > 0;
  $('#co').hidden = !has;
  $('#co-empty').hidden = has;
  if (has) refreshTotals();
}

/* ---------- التأكيد ---------- */

function orderNumber() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `VS-${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${rnd}`;
}

function submitOrder() {
  const bad = validate(true);
  const alert = $('#co-alert');

  if (bad) {
    alert.hidden = false;
    alert.textContent = 'الطلب لم يُرسَل: أكمل الحقول المعلَّمة بالأحمر.';
    $('#' + bad).focus();
    $('#' + bad).scrollIntoView({ block: 'center', behavior: 'smooth' });
    return;
  }
  alert.hidden = true;

  const gov = $('#f-gov').value;
  const sub = Cart.subtotal();
  const ship = shipping(gov, sub);
  const num = orderNumber();

  const order = {
    number: num, at: new Date().toISOString(),
    customer: {
      name: $('#f-name').value.trim(),
      phone: $('#f-phone').value.replace(/[\s-]/g, ''),
      gov, city: $('#f-city').value.trim(),
      landmark: $('#f-landmark').value.trim(),
      address: $('#f-address').value.trim(),
      notes: $('#f-notes').value.trim()
    },
    items: Cart.items, subtotal: sub, shipping: ship, total: sub + ship,
    payment: 'الدفع عند الاستلام'
  };

  /* حفظ محلي فقط — لا شبكة ولا طرف ثالث. */
  try {
    const prev = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    prev.push(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(prev));
  } catch (e) { /* التخزين غير متاح: التأكيد يُعرض على أي حال */ }

  $('#done-num').textContent = `رقم الطلب ${num}`;
  $('#done-summary').innerHTML = `
    <div><dt>المستلِم</dt><dd>${order.customer.name}</dd></div>
    <div><dt>الهاتف</dt><dd dir="ltr">${order.customer.phone}</dd></div>
    <div><dt>العنوان</dt><dd>${gov} — ${order.customer.city}، ${order.customer.landmark}</dd></div>
    <div><dt>عدد القطع</dt><dd>${money(Cart.count())}</dd></div>
    <div><dt>التوصيل</dt><dd>${ship === 0 ? 'مجاني' : price(ship)}</dd></div>
    <div class="dl__total"><dt>الإجمالي</dt><dd>${price(order.total)}</dd></div>`;

  Cart.clear();
  syncCart();
  $('#co').hidden = true;
  $('#co-empty').hidden = true;
  $('#co-done').hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- الإقلاع ---------- */

document.addEventListener('DOMContentLoaded', () => {
  bootShop('checkout');

  const sel = $('#f-gov');
  GOVERNORATES.forEach(g => {
    const o = document.createElement('option');
    o.value = g; o.textContent = g;
    sel.append(o);
  });
  $('#sum-free').textContent = price(FREE_OVER);

  syncCart();
  showState();
  /* تعديل الكمية أو الحذف يعيد حساب التوصيل والإجمالي */
  wireCartControls(showState);

  sel.addEventListener('change', () => { fieldError('f-gov', ''); refreshTotals(); });

  /* التحقّق عند مغادرة الحقل: تصحيح مبكّر بدل مفاجأة عند الإرسال */
  RULES.forEach(([id, ok, msg]) => {
    $('#' + id).addEventListener('blur', () => {
      const v = $('#' + id).value;
      if (v.trim()) fieldError(id, ok(v) ? '' : msg);
    });
    $('#' + id).addEventListener('input', () => {
      if ($('#' + id).getAttribute('aria-invalid') === 'true' && ok($('#' + id).value)) fieldError(id, '');
    });
  });

  $('#co-submit').addEventListener('click', submitOrder);
  $('#co-fields').addEventListener('submit', e => { e.preventDefault(); submitOrder(); });
});
