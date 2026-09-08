/* الطلبات المحفوظة محلياً. لا خادم: هذه طلبات هذا المتصفّح وحده. */

const KEY = 'vitas.orders.v1';

export const STATUSES = [
  { id: 'new',       label: 'جديد',          tone: 'bg-marker text-white' },
  { id: 'preparing', label: 'قيد التجهيز',   tone: 'bg-blueprint text-white' },
  { id: 'shipping',  label: 'قيد التوصيل',   tone: 'bg-scrub text-white' },
  { id: 'done',      label: 'مكتمل',         tone: 'bg-ink text-paper' },
  { id: 'cancelled', label: 'ملغى',          tone: 'bg-paper-3 text-ink-soft' }
];

export const statusOf = id => STATUSES.find(s => s.id === id) || STATUSES[0];

/* الطلبات التي أُنشئت قبل وجود اللوحة لا تحمل حقل status — يُضاف عند القراءة. */
export function readOrders() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    return raw.map(o => ({ ...o, status: o.status || 'new' }))
              .sort((a, b) => String(b.at).localeCompare(String(a.at)));
  } catch { return []; }
}

export function writeOrders(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ذاكرة فقط */ }
}

export function setStatus(number, status) {
  const list = readOrders().map(o => (o.number === number ? { ...o, status } : o));
  writeOrders(list);
  return list;
}

export function removeOrder(number) {
  const list = readOrders().filter(o => o.number !== number);
  writeOrders(list);
  return list;
}

/* تاريخ ميلادي بأرقام عربية وترتيب ثابت — لا نترك التنسيق للمصادفة. */
export function fmtDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return '—';
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).format(d);
}
