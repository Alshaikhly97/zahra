/* vitaS — صفحة المنتج الكاملة. تُعرَّف القطعة من ?code=VS-01 */

function relatedCard(p) {
  const c = COLORWAYS[p.colors ? p.colors[0] : p.color];
  const el = document.createElement('article');
  el.className = 'card';
  el.innerHTML = `
    <div class="card__top mono"><span class="code">${p.code}</span><span>${money(p.gsm || 0) || ''}</span></div>
    <a class="card__fig" href="product.html?code=${p.code}"
       aria-label="${p.name}">${garment(p.type, c, {
      accent: p.accentColor, pattern: p.pattern, embroidery: p.embroidery, reflective: p.reflective
    })}</a>
    <h3><a class="card__link" href="product.html?code=${p.code}">${p.name}</a></h3>
    <p class="card__tag">${p.tagline || p.story}</p>
    <div class="card__foot">
      <span class="price">${money(p.price)} <span>د.ع</span></span>
      <a class="btn" href="product.html?code=${p.code}">التفاصيل</a>
    </div>`;
  return el;
}

document.addEventListener('DOMContentLoaded', () => {
  bootShop('collection');

  const code = new URLSearchParams(location.search).get('code');
  const p = code ? loadProduct(code) : null;

  /* رابط بلا كود أو بكود مجهول لا يترك صفحة بيضاء. */
  if (!p) {
    $('#pdp-404').hidden = false;
    document.title = 'لم نجد هذه القطعة — vitaS';
    return;
  }

  const isEdition = EDITIONS.some(e => e.code === p.code);
  document.title = `${p.name} — vitaS`;
  $('#pdp').hidden = false;
  $('#related-sec').hidden = false;

  $('#crumb-sec').textContent = isEdition ? 'الإصدارات الخاصة' : 'المجموعة';
  $('#crumb-sec').href = isEdition ? 'index.html#editions' : 'index.html#collection';
  $('#crumb-now').textContent = p.name;

  $('#pdp-eyebrow').textContent = isEdition ? `إصدار محدود · ${p.run}` : `ورقة المواصفات · ${p.code}`;
  $('#pd-title').textContent = p.name;
  $('#pdp-price').textContent = price(p.price);
  $('#ship-bg').textContent = price(DELIVERY['بغداد']);
  $('#ship-other').textContent = price(DELIVERY.default);

  renderDetail();

  $('#pd-add').addEventListener('click', () => {
    if (addToCart()) openDrawer('#ct');
  });

  /* قطع أخرى: من الإصدارات إن كانت القطعة إصداراً، ومن المجموعة خلاف ذلك */
  const pool = (isEdition ? EDITIONS : PRODUCTS).filter(x => x.code !== p.code).slice(0, 4);
  const box = $('#related');
  pool.forEach(x => box.append(relatedCard(x)));
});
