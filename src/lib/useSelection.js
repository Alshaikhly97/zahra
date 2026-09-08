import { useState } from 'react';
import { INSEAMS } from '../data/catalog';

const initSel = p => ({
  fit: 'women',
  color: p ? (p.colors ? p.colors[0] : p.color) : null,
  size: null,
  inseam: p && p.inseam ? INSEAMS[1] : null,
  view: 0
});

/* حالة اختيارات المنتج: القَصّة واللون والمقاس واللقطة المعروضة.

   التصفير يتم أثناء العرض لا في useEffect: مع useEffect يقع عرض واحد
   بحالة المنتج السابق قبل أن يعمل الأثر، فيصبح sel.color قيمة لا وجود
   لها في المنتج الجديد ويسقط COLORWAYS[sel.color].name.
   ضبط الحالة أثناء العرض عند تغيّر المدخلات نمط موثّق في React. */
export function useSelection(product) {
  const code = product ? product.code : null;
  const [sel, setSel] = useState(() => initSel(product));
  const [forCode, setForCode] = useState(code);

  if (code !== forCode) {
    setForCode(code);
    setSel(initSel(product));
  }

  const set = patch => setSel(s => ({ ...s, ...patch }));
  return [code === forCode ? sel : initSel(product), set];
}

/* القَصّة جزء من الهوية: نسائي M ورجالي M قطعتان مختلفتان، لا سطر واحد بكميتين. */
export function cartItem(p, sel) {
  return {
    key: [p.code, sel.fit, sel.color, sel.size, sel.inseam].join('|'),
    code: p.code, name: p.name, type: p.type, price: p.price,
    color: sel.color, size: sel.size, inseam: sel.inseam, fit: sel.fit, qty: 1,
    opts: { accent: p.accentColor, pattern: p.pattern,
            embroidery: p.embroidery, reflective: p.reflective }
  };
}
