/* السلة تعبر ثلاث صفحات، فتُحفظ في localStorage.
   بعض المتصفّحات تمنعه على file:// — عندها نعمل من الذاكرة بلا انهيار. */

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'vitas.cart.v1';
const CartCtx = createContext(null);

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v : [];
  } catch { return []; }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(read);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* ذاكرة فقط */ }
  }, [items]);

  const api = useMemo(() => ({
    items,
    add(item) {
      setItems(prev => {
        const i = prev.findIndex(x => x.key === item.key);
        if (i === -1) return [...prev, { ...item, qty: item.qty || 1 }];
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + (item.qty || 1) };
        return next;
      });
    },
    setQty(key, n) {
      /* NumberField يرسل NaN عند إفراغ الخانة، و NaN <= 0 خطأ فيمرّ إلى
         الضرب فيصبح المجموع NaN وينتقل إلى الطلب المحفوظ. */
      if (!Number.isFinite(n)) return;
      setItems(prev => n <= 0
        ? prev.filter(x => x.key !== key)
        : prev.map(x => (x.key === key ? { ...x, qty: Math.min(99, Math.round(n)) } : x)));
    },
    remove(key) { setItems(prev => prev.filter(x => x.key !== key)); },
    clear() { setItems([]); },
    count: items.reduce((s, i) => s + i.qty, 0),
    subtotal: items.reduce((s, i) => s + i.qty * i.price, 0)
  }), [items]);

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>;
}

export const useCart = () => useContext(CartCtx);

/* ---------- التوصيل ---------- */
/* أجرة التوصيل داخل بغداد أقل منها إلى بقيّة المحافظات — الواقع العملي في العراق. */
export const GOVERNORATES = [
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'ذي قار', 'الأنبار',
  'ديالى', 'السليمانية', 'بابل', 'كركوك', 'صلاح الدين', 'واسط', 'ميسان',
  'دهوك', 'المثنى', 'القادسية', 'حلبجة'
];
export const DELIVERY = { baghdad: 5000, other: 10000 };
export const FREE_OVER = 200000;
export const shipping = (gov, sub) =>
  !gov ? null : sub >= FREE_OVER ? 0 : (gov === 'بغداد' ? DELIVERY.baghdad : DELIVERY.other);
