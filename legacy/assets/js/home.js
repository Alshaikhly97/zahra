/* vitaS — الصفحة الرئيسية: المخطّط الفني التفاعلي، الشبكات، ودرج المعاينة السريعة. */

/* ============ البطل: المخطّط الفني التفاعلي ============ */

function buildSchematic() {
  const stage = $('#stage');
  const note  = $('#note');
  if (!stage) return;

  stage.insertAdjacentHTML('afterbegin', garment('top', COLORWAYS.surgical, { big: true }));

  CALLOUTS.forEach(k => {
    const b = document.createElement('button');
    b.className = 'dot';
    b.type = 'button';
    /* إحداثيات فيزيائية مقصودة: النقاط تُركَّب فوق رسم SVG بإحداثيات ثابتة لا تُعكس مع الاتجاه. */
    b.style.left = k.x + '%';
    b.style.top  = k.y + '%';
    b.setAttribute('aria-expanded', 'false');
    b.setAttribute('aria-controls', 'note');
    b.innerHTML = `<span aria-hidden="true">${money(k.n)}</span><span class="sr-only">${k.title}</span>`;
    const show = () => {
      $$('.dot').forEach(d => d.setAttribute('aria-expanded', 'false'));
      b.setAttribute('aria-expanded', 'true');
      note.innerHTML = `<span class="mono">${pad2(k.n)} — تفصيل</span>
                        <h3>${k.title}</h3><p>${k.body}</p>`;
    };
    b.addEventListener('click', show);
    b.addEventListener('mouseenter', show);
    b.addEventListener('focus', show);
    stage.append(b);
  });
}

/* ============ بطاقات الشبكة ============ */
/* البطاقة محايدة الجنس عمداً: التمييز بين نسائي ورجالي يبدأ داخل المنتج. */

function productCard(p) {
  const el = document.createElement('article');
  el.className = 'card';
  const first = COLORWAYS[p.colors[0]];
  el.innerHTML = `
    <div class="card__top mono"><span class="code">${p.code}</span><span>${money(p.gsm)} غ/م²</span></div>
    <a class="card__fig" data-fig href="product.html?code=${p.code}"
       aria-label="الصفحة الكاملة — ${p.name}">${garment(p.type, first)}</a>
    <h3><a class="card__link" href="product.html?code=${p.code}">${p.name}</a></h3>
    <p class="card__tag">${p.tagline}</p>
    <div class="card__spec">
      <span>${pockets(p.pockets)}</span>
      <span>مطاطية ${p.stretch}</span>
    </div>
    <div class="swatches" role="group" aria-label="ألوان ${p.name}"></div>
    <div class="card__foot">
      <span class="price">${money(p.price)} <span>د.ع</span></span>
      <button class="btn" type="button" data-product="${p.code}">معاينة سريعة</button>
    </div>`;

  const sws = $('.swatches', el);
  const fig = $('[data-fig]', el);
  p.colors.forEach((key, i) => {
    const c = COLORWAYS[key];
    const b = document.createElement('button');
    b.className = 'sw'; b.type = 'button';
    b.style.background = c.hex;
    b.setAttribute('aria-pressed', String(i === 0));
    b.setAttribute('aria-label', c.name);
    b.title = c.name;
    b.addEventListener('click', () => {
      $$('.sw', sws).forEach(s => s.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      fig.innerHTML = garment(p.type, c);
      state.picked[p.code] = key;
    });
    sws.append(b);
  });
  return el;
}

function editionCard(e) {
  const c = COLORWAYS[e.color];
  const el = document.createElement('article');
  el.className = 'ed';
  el.style.setProperty('--ed-accent', e.accentColor);
  el.innerHTML = `
    <div class="ed__no"><span class="code">${e.code}</span><b>${e.run}</b></div>
    <a class="ed__fig" href="product.html?code=${e.code}"
       aria-label="الصفحة الكاملة — ${e.name}">${garment(e.type, c, {
      accent: e.accentColor, pattern: e.pattern, embroidery: e.embroidery, reflective: e.reflective
    })}</a>
    <h3><a class="card__link" href="product.html?code=${e.code}">${e.name}</a></h3>
    <div class="ed__unit">${e.unit}</div>
    <p class="ed__story">${e.story}</p>
    <div class="ed__foot">
      <span class="price">${money(e.price)} <span>د.ع</span></span>
      <button class="btn" type="button" data-product="${e.code}">معاينة سريعة</button>
    </div>`;
  return el;
}

/* ============ الإقلاع ============ */

document.addEventListener('DOMContentLoaded', () => {
  bootShop('collection');
  buildSchematic();

  const grid = $('#grid');
  PRODUCTS.forEach(p => grid.append(productCard(p)));

  const eds = $('#eds');
  EDITIONS.forEach(e => eds.append(editionCard(e)));

  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-product]');
    if (trigger) {
      if (!loadProduct(trigger.dataset.product)) return;
      $('#pd-title').textContent = state.current.name;
      renderDetail({ fullLink: true });
      openDrawer('#pd');
    }
  });

  $('#pd-add').addEventListener('click', () => { if (addToCart()) closeDrawer('#pd'); });
  $('#ct-checkout').addEventListener('click', () => { location.href = 'checkout.html'; });
});
