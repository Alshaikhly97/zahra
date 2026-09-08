/* موجّه بالهاش: يعمل على أي استضافة ثابتة وعلى file:// بلا إعدادات خادم،
   وبلا اعتماد إضافي. المسارات: #/ و #/product/VS-01 و #/checkout و #/admin */

import { useEffect, useState } from 'react';

export function useRoute() {
  const parse = () => {
    const h = location.hash.replace(/^#/, '') || '/';
    const [, seg, arg] = h.split('/');
    if (seg === 'product') return { name: 'product', code: arg ? decodeURIComponent(arg) : null };
    if (seg === 'checkout') return { name: 'checkout' };
    if (seg === 'admin') return { name: 'admin' };
    return { name: 'home', hash: h };
  };
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => { setRoute(parse()); };
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  return route;
}

export function go(path) {
  location.hash = path;
  if (!path.includes('#')) scrollTo({ top: 0 });
}

export const href = p => '#' + p;
