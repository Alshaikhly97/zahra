/* vitaS — طبقة المتجر المشتركة بين الصفحات:
   تخزين السلة، الترويسة والتذييل، معرض الصور، تفاصيل المنتج، الأدراج. */

/* ============ تخزين السلة ============ */
/* السلة تعبر ثلاث صفحات، فلا يصحّ بقاؤها في الذاكرة وحدها.
   بعض المتصفّحات تمنع localStorage على file:// — عندها نعمل بالذاكرة وننبّه. */

const Cart = {
  KEY: 'vitas.cart.v1',
  items: [],
  memoryOnly: false,

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      this.items = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      this.memoryOnly = true;
      this.items = [];
    }
    return this.items;
  },

  save() {
    if (this.memoryOnly) return;
    try {
      localStorage.setItem(this.KEY, JSON.stringify(this.items));
    } catch (e) {
      this.memoryOnly = true;
    }
  },

  add(item) {
    const found = this.items.find(i => i.key === item.key);
    if (found) found.qty += item.qty || 1;
    else this.items.push(Object.assign({}, item, { qty: item.qty || 1 }));
    this.save();
  },

  setQty(key, n) {
    const it = this.items.find(i => i.key === key);
    if (!it) return;
    it.qty = Math.max(1, Math.min(99, n));
    this.save();
  },

  remove(key) {
    this.items = this.items.filter(i => i.key !== key);
    this.save();
  },

  clear() { this.items = []; this.save(); },

  count()    { return this.items.reduce((s, i) => s + i.qty, 0); },
  subtotal() { return this.items.reduce((s, i) => s + i.qty * i.price, 0); }
};

/* ============ التوصيل ============ */
/* أجرة التوصيل داخل بغداد أقل منها إلى بقيّة المحافظات — الواقع العملي في العراق. */
const GOVERNORATES = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'ذي قار', 'الأنبار',
  'ديالى', 'السليمانية', 'بابل', 'كركوك', 'صلاح الدين', 'واسط', 'ميسان',
  'دهوك', 'المثنى', 'القادسية', 'حلبجة'
];
const DELIVERY = { 'بغداد': 5000, default: 10000 };
const deliveryFee = gov => (gov === 'بغداد' ? DELIVERY['بغداد'] : DELIVERY.default);
const FREE_OVER = 200000;

function shipping(gov, sub) {
  if (!gov) return null;
  return sub >= FREE_OVER ? 0 : deliveryFee(gov);
}

/* ============ الترويسة والتذييل ============ */
/* تُولَّد من هنا بدل نسخها في ثلاث صفحات، فلا تتفارق شارة السلة بينها. */

function chrome(active) {
  const nav = [
    ['index.html#collection', 'المجموعة', 'collection'],
    ['index.html#editions', 'الإصدارات الخاصة', 'editions'],
    ['index.html#fabric', 'القماش', 'fabric'],
    ['index.html#sizes', 'المقاسات', 'sizes']
  ];
  const hdr = $('#chrome-hdr');
  if (hdr) hdr.innerHTML = `
    <div class="hdr__in">
      <a class="brand" href="index.html" dir="ltr"><b>vita</b><i>S</i></a>
      <nav class="nav" aria-label="الرئيسية">
        ${nav.map(([href, label, id]) =>
          `<a href="${href}"${id === active ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
      </nav>
      <button class="cart-btn" id="cart-open" type="button" aria-label="السلة">
        السلة <span class="cart-btn__n" id="cart-n">0</span>
      </button>
    </div>`;

  const ftr = $('#chrome-ftr');
  if (ftr) ftr.innerHTML = `
    <div class="wrap">
      <div class="ftr__grid">
        <div>
          <a class="brand" href="index.html" dir="ltr"><b>vita</b><i>S</i></a>
          <p class="ftr__lede">ألبسة طبية تُصمَّم مع من يلبسها، وتُختبر في المناوبة لا في الاستوديو.</p>
        </div>
        <div>
          <h3>المتجر</h3>
          <ul>
            <li><a href="index.html#collection">المجموعة الأساسية</a></li>
            <li><a href="index.html#editions">الإصدارات الخاصة</a></li>
            <li><a href="index.html#sizes">دليل المقاسات</a></li>
          </ul>
        </div>
        <div>
          <h3>المساعدة</h3>
          <ul>
            <li><a href="index.html#sizes">الاستبدال والإرجاع</a></li>
            <li><a href="index.html#fabric">العناية بالقماش</a></li>
            <li><a href="checkout.html">السلة وإتمام الطلب</a></li>
          </ul>
        </div>
        <div>
          <h3>التوصيل</h3>
          <ul>
            <li><a href="checkout.html">بغداد ${money(DELIVERY['بغداد'])} د.ع</a></li>
            <li><a href="checkout.html">بقيّة المحافظات ${money(DELIVERY.default)} د.ع</a></li>
            <li><a href="checkout.html">توصيل مجاني فوق ${money(FREE_OVER)} د.ع</a></li>
          </ul>
        </div>
      </div>
      <div class="ftr__base mono">
        <span>© ٢٠٢٦ vitaS</span>
        <span>عرض توضيحي — لا يُرسَل أي طلب فعلياً</span>
        <span>صور الموديلات من Freepik بترخيص مجاني — يلزم ذكر المصدر</span>
      </div>
    </div>`;
}

/* ============ الحالة ============ */

const state = { picked: {}, fitPick: {}, current: null,
                size: null, inseam: null, color: null, fit: 'women', view: 0 };
const ALL = () => [...PRODUCTS, ...EDITIONS];
const findProduct = code => ALL().find(x => x.code === code);

/* ============ معرض صور المنتج ============ */
/* لقطات الموديل تتبع القَصّة المختارة؛ ولقطة «القطعة مسطّحة» تتبع اللون المختار
   وهي المرجع اللوني الصحيح لأن التصوير لا يغطّي كل الألوان. */

function galleryShots(p, fit) {
  const keys = (p.models && p.models[fit]) || [];
  const shots = keys.map(k => Object.assign({ kind: 'photo' }, PHOTOS[k])).filter(x => x.src);
  shots.push({ kind: 'flat', label: 'القطعة مسطّحة' });
  return shots;
}

function renderGallery() {
  const p = state.current, c = COLORWAYS[state.color];
  if (!p || !$('#pd-stage')) return;
  const shots = galleryShots(p, state.fit);
  if (state.view >= shots.length) state.view = 0;
  const cur = shots[state.view];
  const opts = { accent: p.accentColor, pattern: p.pattern,
                 embroidery: p.embroidery, reflective: p.reflective };

  $('#pd-stage').innerHTML = cur.kind === 'photo'
    ? `<img src="${cur.src}" alt="${cur.alt}" loading="lazy" decoding="async">`
    : `<div class="gal__flat">${garment(p.type, c, opts)}</div>`;

  /* التصوير لا يغطّي كل الألوان، فيُذكر لون الصورة ولون القطعة صراحةً عند اختلافهما. */
  $('#pd-cap').textContent = cur.kind !== 'photo'
    ? `${c.name} — الرسم يتبع اللون المختار`
    : cur.color === c.name
      ? `الصورة باللون ${c.name}`
      : `الصورة باللون ${cur.color} · لون القطعة المختار ${c.name} — يظهر في لقطة «القطعة مسطّحة»`;

  const t = $('#pd-thumbs');
  t.innerHTML = '';
  shots.forEach((sh, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'thumb';
    b.setAttribute('aria-pressed', String(i === state.view));
    b.setAttribute('aria-label', sh.kind === 'photo' ? sh.alt : sh.label);
    b.innerHTML = sh.kind === 'photo'
      ? `<img src="${sh.src}" alt="" loading="lazy" decoding="async">`
      : `<span class="thumb__flat">${garment(p.type, c, opts)}</span>`;
    b.addEventListener('click', () => { state.view = i; renderGallery(); });
    t.append(b);
  });
}

/* ============ تفاصيل المنتج ============ */
/* نفس المُصيّر يخدم درج المعاينة السريعة والصفحة الكاملة:
   كلاهما يوفّر #pd-gallery و #pd-info. */

function loadProduct(code) {
  const p = findProduct(code);
  if (!p) return null;
  state.current = p;
  state.size = null;
  state.inseam = p.inseam ? INSEAMS[1] : null;
  state.color = state.picked[code] || (p.colors ? p.colors[0] : p.color);
  state.fit = state.fitPick[code] || 'women';
  state.view = 0;
  return p;
}

function renderDetail(opts = {}) {
  const p = state.current;
  const c = COLORWAYS[state.color];
  const colorList = p.colors || [p.color];

  $('#pd-gallery').innerHTML = `
    <div class="gal">
      <div class="gal__stage" id="pd-stage"></div>
      <div class="gal__thumbs" id="pd-thumbs" role="group" aria-label="لقطات المنتج"></div>
      <p class="gal__cap mono" id="pd-cap"></p>
    </div>`;

  $('#pd-info').innerHTML = `
    <p class="mono" style="color:var(--marker)">${p.code} · ${c.name}</p>
    <p style="color:var(--ink-soft);margin-block:.4rem 1.6rem">${p.tagline || p.story}</p>

    <div class="field">
      <span class="mono">القَصّة</span>
      <div class="opts" id="pd-fits" role="group" aria-label="القَصّة"></div>
    </div>

    ${colorList.length > 1 ? `<div class="field">
      <span class="mono">اللون</span>
      <div class="opts" id="pd-colors" role="group" aria-label="اللون"></div>
    </div>` : ''}

    <div class="field">
      <span class="mono">المقاس</span>
      <div class="opts" id="pd-sizes" role="group" aria-label="المقاس"></div>
    </div>

    ${p.inseam ? `<div class="field">
      <span class="mono">طول الساق</span>
      <div class="opts" id="pd-inseams" role="group" aria-label="طول الساق"></div>
    </div>` : ''}

    ${p.specs ? `<dl class="dl">${p.specs.map(([k, v]) =>
      `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
      <div><dt>القماش</dt><dd>${p.fabric}</dd></div></dl>` : ''}

    ${opts.fullLink ? `<p class="detail__more">
      <a href="product.html?code=${p.code}">الصفحة الكاملة للمنتج ←</a></p>` : ''}`;

  if (colorList.length > 1) {
    const box = $('#pd-colors');
    colorList.forEach(key => {
      const cc = COLORWAYS[key];
      const b = document.createElement('button');
      b.className = 'opt'; b.type = 'button'; b.textContent = cc.name;
      b.setAttribute('aria-pressed', String(key === state.color));
      b.addEventListener('click', () => {
        state.color = key; state.picked[p.code] = key; renderDetail(opts);
      });
      box.append(b);
    });
  }

  buildOpts('#pd-fits', Object.keys(FITS).map(k => FITS[k].name), FITS[state.fit].name, v => {
    state.fit = Object.keys(FITS).find(k => FITS[k].name === v);
    state.fitPick[p.code] = state.fit;
    state.view = 0;
    renderGallery();
  });

  buildOpts('#pd-sizes', SIZES, state.size, v => { state.size = v; });
  if (p.inseam) buildOpts('#pd-inseams', INSEAMS, state.inseam, v => { state.inseam = v; });

  renderGallery();
  if ($('#pd-add')) $('#pd-add').textContent = `أضف إلى السلة — ${price(p.price)}`;
  if ($('#pd-msg')) $('#pd-msg').textContent = '';
}

function buildOpts(sel, list, active, onPick) {
  const box = $(sel);
  if (!box) return;
  box.innerHTML = '';
  list.forEach(v => {
    const b = document.createElement('button');
    b.className = 'opt'; b.type = 'button'; b.textContent = v;
    b.setAttribute('aria-pressed', String(v === active));
    b.addEventListener('click', () => {
      [...box.children].forEach(x => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      onPick(v);
      if ($('#pd-msg')) $('#pd-msg').textContent = '';
    });
    box.append(b);
  });
}

function addToCart() {
  const p = state.current;
  if (!state.size) {
    /* الخطأ يقول ما الناقص وأين — لا اعتذار ولا غموض. */
    if ($('#pd-msg')) $('#pd-msg').textContent = 'اختر المقاس قبل الإضافة.';
    $('#pd-sizes')?.scrollIntoView({ block: 'center' });
    return false;
  }
  /* القَصّة جزء من الهوية: نسائي M ورجالي M قطعتان مختلفتان، لا سطر واحد بكميتين. */
  const key = [p.code, state.fit, state.color, state.size, state.inseam].join('|');
  Cart.add({
    key, code: p.code, name: p.name, type: p.type, price: p.price,
    color: state.color, size: state.size, inseam: state.inseam,
    fit: state.fit, qty: 1,
    opts: { accent: p.accentColor, pattern: p.pattern,
            embroidery: p.embroidery, reflective: p.reflective }
  });
  syncCart();
  toast(`أُضيف ${p.name} — ${FITS[state.fit].name} · مقاس ${state.size}`);
  return true;
}

/* ============ عرض السلة ============ */

function cartLineHTML(i) {
  const c = COLORWAYS[i.color];
  return `<div class="line">
    <div class="line__fig">${garment(i.type, c, i.opts)}</div>
    <div class="line__b">
      <h3>${i.name}</h3>
      <div class="mono">${i.code} · ${FITS[i.fit].name} · ${c.name} · ${i.size}${i.inseam ? ' · ' + i.inseam : ''}</div>
      <div class="qty" role="group" aria-label="كمية ${i.name}">
        <button type="button" class="qty__b" data-dec="${i.key}" aria-label="إنقاص الكمية">−</button>
        <span class="qty__n mono" aria-live="polite">${money(i.qty)}</span>
        <button type="button" class="qty__b" data-inc="${i.key}" aria-label="زيادة الكمية">+</button>
        <span class="line__sum mono">${price(i.price * i.qty)}</span>
      </div>
      <button class="line__rm" type="button" data-rm="${i.key}">حذف</button>
    </div>
  </div>`;
}

function syncCart() {
  const n = Cart.count();
  const badge = $('#cart-n');
  if (badge) {
    badge.textContent = money(n);
    badge.closest('button')?.setAttribute('aria-label', `السلة — ${money(n)} قطعة`);
  }

  const body = $('#ct-body');
  if (!body) return;

  /* صفحة إتمام الطلب تعرض السطور بلا تذييل الدرج ولا مجموعه — كلاهما اختياري. */
  const foot  = $('#ct-foot');
  const total = $('#ct-total');

  if (!Cart.items.length) {
    body.innerHTML = `<div class="empty">
      <h3>السلة فارغة</h3>
      <p>ابدأ من المجموعة الأساسية أو من إصدار محدود.</p>
      <a class="btn btn--ghost" href="index.html#collection">تصفّح المجموعة</a>
    </div>`;
    if (foot) foot.hidden = true;
    return;
  }
  if (foot) foot.hidden = false;
  body.innerHTML = Cart.items.map(cartLineHTML).join('');
  if (total) total.textContent = price(Cart.subtotal());
}

/* تفويض أحداث السلة — يعمل في الدرج وفي صفحة إتمام الطلب معاً.
   الربط مرّة واحدة فقط: bootShop و checkout كلاهما ينادي هذه الدالة،
   وربطان يعنيان زيادة الكمّية خطوتين عند كل نقرة. */
let cartWired = false;
const cartHooks = [];

function wireCartControls(onChange) {
  if (onChange) cartHooks.push(onChange);
  if (cartWired) return;
  cartWired = true;

  document.addEventListener('click', e => {
    const inc = e.target.closest('[data-inc]');
    const dec = e.target.closest('[data-dec]');
    const rm  = e.target.closest('[data-rm]');
    if (!inc && !dec && !rm) return;

    const key = (inc || dec || rm).dataset[inc ? 'inc' : dec ? 'dec' : 'rm'];
    const it  = Cart.items.find(i => i.key === key);
    /* السطر قد يكون حُذف بالفعل — لا نفترض وجوده. */
    if (!it) { syncCart(); cartHooks.forEach(f => f()); return; }

    if (inc) {
      Cart.setQty(key, it.qty + 1);
    } else if (dec && it.qty > 1) {
      Cart.setQty(key, it.qty - 1);
    } else {
      Cart.remove(key);
      toast('حُذف من السلة');
    }
    syncCart();
    cartHooks.forEach(f => f());
  });
}

/* ============ الأدراج والإشعار ============ */

let lastFocus = null;

function openDrawer(sel) {
  lastFocus = document.activeElement;
  $(sel).dataset.open = 'true';
  $('#scrim').dataset.open = 'true';
  document.body.style.overflow = 'hidden';
  setTimeout(() => $(sel).querySelector('.x')?.focus(), 60);
}

function closeDrawer(sel) {
  $(sel).dataset.open = 'false';
  if (!$$('.drawer[data-open="true"]').length) {
    $('#scrim').dataset.open = 'false';
    document.body.style.overflow = '';
  }
  lastFocus?.focus();
}

let toastT;
function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.dataset.open = 'true';
  clearTimeout(toastT);
  toastT = setTimeout(() => (t.dataset.open = 'false'), 3200);
}

/* حصر التركيز داخل الدرج المفتوح */
function trap(e) {
  if (e.key !== 'Tab') return;
  const d = $('.drawer[data-open="true"]');
  if (!d) return;
  const f = $$('button, [href], input, select, textarea', d).filter(x => !x.disabled && x.offsetParent !== null);
  if (!f.length) return;
  const [a, z] = [f[0], f[f.length - 1]];
  if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
  else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
}

/* ============ تهيئة مشتركة ============ */

function bootShop(activeNav) {
  Cart.load();
  chrome(activeNav);
  syncCart();
  wireCartControls();

  document.addEventListener('click', e => {
    if (e.target.closest('#cart-open')) {
      if ($('#ct')) { syncCart(); openDrawer('#ct'); }
      else location.href = 'checkout.html';
      return;
    }
    const x = e.target.closest('[data-close]');
    if (x) { closeDrawer(x.dataset.close); return; }
    if (e.target.id === 'scrim') $$('.drawer[data-open="true"]').forEach(d => closeDrawer('#' + d.id));
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') $$('.drawer[data-open="true"]').forEach(d => closeDrawer('#' + d.id));
    trap(e);
  });
}
