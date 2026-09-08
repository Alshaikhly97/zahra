/* محتوى الواجهة القابل للتحرير من لوحة التحكّم.

   التخزين يحفظ **الفروق فقط** لا نسخة كاملة: أي تعديل لاحق على النصوص
   الافتراضية في الشيفرة يظهر لمن لم يعدّل ذلك المفتاح. */

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { PRODUCTS, EDITIONS, COLORWAYS, PHOTOS } from '../data/catalog';

const KEY = 'vitas.content.v1';

/* الأقسام بالترتيب الذي تظهر به في الصفحة.
   `nav` هو نصّ الرابط في الترويسة — القسم بلا nav لا يظهر فيها. */
export const SECTIONS = [
  { id: 'hero',       label: 'البطل والمخطّط الفني', nav: null },
  { id: 'collection', label: 'المجموعة الأساسية',    nav: 'المجموعة' },
  { id: 'editions',   label: 'الإصدارات الخاصة',     nav: 'الإصدارات الخاصة' },
  { id: 'fabric',     label: 'ورقة القماش',          nav: 'القماش' },
  { id: 'sizes',      label: 'دليل المقاسات',        nav: 'المقاسات' }
];

/* كل نصّ قابل للتحرير: قسمه، وصفه للمحرّر، وقيمته الافتراضية.
   تبويب النصوص يُبنى من هذا الكائن مباشرةً فلا تتفرّق قائمتان. */
export const TEXTS = {
  'hero.eyebrow':    { section: 'hero', label: 'شريط علوي', value: 'ورقة المواصفات · VS-01' },
  'hero.title.a':    { section: 'hero', label: 'العنوان — الجزء الأول', value: 'ملابس تُقاس' },
  'hero.title.em':   { section: 'hero', label: 'العنوان — الكلمة المميّزة (تحتها خط)', value: 'بالساعة' },
  'hero.title.b':    { section: 'hero', label: 'العنوان — الجزء الأخير', value: 'لا بالمقاس وحده.' },
  'hero.lede':       { section: 'hero', label: 'الفقرة التمهيدية', multiline: true,
    value: 'صمّمنا كل درزة وجيب على مناوبة من اثنتي عشرة ساعة: تنحني، تركض، تحمل، وتعود في اليوم التالي إلى القطعة نفسها.' },
  'hero.cta1':       { section: 'hero', label: 'زرّ أساسي', value: 'تصفّح المجموعة' },
  'hero.cta2':       { section: 'hero', label: 'زرّ ثانوي', value: 'الإصدارات الخاصة' },
  'hero.stat1.v':    { section: 'hero', label: 'إحصاءة ١ — الرقم', value: '١٢' },
  'hero.stat1.l':    { section: 'hero', label: 'إحصاءة ١ — الوصف', value: 'ساعة مناوبة' },
  'hero.stat2.v':    { section: 'hero', label: 'إحصاءة ٢ — الرقم', value: '٦٠' },
  'hero.stat2.l':    { section: 'hero', label: 'إحصاءة ٢ — الوصف', value: 'درجة حرارة الغسيل' },
  'hero.stat3.v':    { section: 'hero', label: 'إحصاءة ٣ — الرقم', value: '٧' },
  'hero.stat3.l':    { section: 'hero', label: 'إحصاءة ٣ — الوصف', value: 'مقاسات' },

  'collection.eyebrow': { section: 'collection', label: 'شريط علوي', value: 'المجموعة الأساسية' },
  'collection.title':   { section: 'collection', label: 'العنوان', value: 'ست قطع تغطّي المناوبة كاملة' },
  'collection.body':    { section: 'collection', label: 'الفقرة', multiline: true,
    value: 'من الطبقة الأولى تحت السكراب إلى الجاكيت الذي تلبسه في القسم البارد. كل قطعة متاحة بألوان الأقسام المعتمدة، وكلها من العائلة القماشية نفسها حتى لا تتفاوت الألوان بينها بعد الغسيل.' },

  'editions.eyebrow': { section: 'editions', label: 'شريط علوي', value: 'إصدارات محدودة' },
  'editions.title':   { section: 'editions', label: 'العنوان', value: 'لكل قسم إصدار يخصّه' },
  'editions.body':    { section: 'editions', label: 'الفقرة', multiline: true,
    value: 'أربعة إصدارات تُطرح بكميات معلنة ولا يُعاد إنتاجها. لكل واحد سبب وجود يأتي من القسم نفسه: لون، أو تفصيلة، أو طريقة لبس.' },

  'fabric.eyebrow': { section: 'fabric', label: 'شريط علوي', value: 'ورقة القماش' },
  'fabric.title':   { section: 'fabric', label: 'العنوان', value: 'ما الذي يجعله يصمد' },

  'sizes.eyebrow': { section: 'sizes', label: 'شريط علوي', value: 'دليل المقاس' },
  'sizes.title':   { section: 'sizes', label: 'العنوان', value: 'قِس قطعة تلبسها الآن' },
  'sizes.body':    { section: 'sizes', label: 'الفقرة', multiline: true,
    value: 'القياسات بالسنتيمتر للجسم لا للقطعة. إن كنت بين مقاسين، اختر الأكبر للقميص والأصغر للبنطال. الجدول واحد للقَصّتين لأنه قياسات جسم.' }
};

/* ============ الكتالوج ============ */
/* الحقول القابلة للتحرير فقط. `type` و `models` و `colors` تقود الرسم والصور
   وتعديلها من اللوحة يكسر العرض، فتُترك في الشيفرة. */

export const PRODUCT_FIELDS = [
  { key: 'name',    label: 'الاسم' },
  { key: 'tagline', label: 'الوصف', multiline: true },
  { key: 'price',   label: 'السعر (دينار)', number: true },
  { key: 'fabric',  label: 'تركيب القماش' }
];

export const EDITION_FIELDS = [
  { key: 'name',  label: 'الاسم' },
  { key: 'unit',  label: 'القسم' },
  { key: 'story', label: 'القصّة', multiline: true },
  { key: 'price', label: 'السعر (دينار)', number: true },
  { key: 'run',   label: 'الكمية المطروحة' }
];

/* ============ جدول المقاسات ============ */
export const SIZE_COLS = ['المقاس', 'الصدر', 'الخصر', 'الورك', 'طول الظهر'];
export const DEFAULT_SIZES = [
  ['XS','٨٢–٨٦','٦٤–٦٨','٨٨–٩٢','٦٤'], ['S','٨٧–٩٢','٦٩–٧٤','٩٣–٩٨','٦٦'],
  ['M','٩٣–٩٨','٧٥–٨٠','٩٩–١٠٤','٦٨'], ['L','٩٩–١٠٦','٨١–٨٨','١٠٥–١١٢','٧٠'],
  ['XL','١٠٧–١١٤','٨٩–٩٦','١١٣–١٢٠','٧٢'], ['2XL','١١٥–١٢٤','٩٧–١٠٦','١٢١–١٣٠','٧٤'],
  ['3XL','١٢٥–١٣٤','١٠٧–١١٦','١٣١–١٤٠','٧٦']
];

/* ============ بطاقات القماش ============ */
export const FABRIC_COLS = ['الرمز', 'العنوان', 'الشرح'];
export const DEFAULT_FABRIC = [
  ['٧٢ / ٢١ / ٧', 'خلطة ثلاثية', 'بوليستر للثبات، ريون للملمس، إيلاستين للمرونة. النسبة نفسها في كل قطعة لتتطابق الألوان.'],
  ['٤ اتجاهات', 'مرونة كاملة', 'يتمدّد طولاً وعرضاً ويعود لشكله، فلا تتوسّع الركبتان ولا المرفقان مع الوقت.'],
  ['DWR', 'طرد السوائل', 'معالجة سطحية تدحرج القطرات بدل امتصاصها، وتصمد حتى الغسلة الخمسين.'],
  ['١٧٥ غ/م²', 'وزن متوسّط', 'ثقيل بما يكفي ليحافظ على القصّة، وخفيف بما يكفي للمناوبات الطويلة في أقسام دافئة.']
];

/* ============ الألوان ============ */
/* رسوم SVG تستعمل hex والظلّ والفاتح معاً. عند تغيير hex وحده نشتقّ الاثنين
   الآخرين، وإلّا بقي التظليل من اللون القديم فيبدو الرسم غير متماسك. */
const clamp = n => Math.max(0, Math.min(255, Math.round(n)));
const toRGB = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const toHex = c => '#' + c.map(v => clamp(v).toString(16).padStart(2, '0')).join('').toUpperCase();
const mixTo = (hex, target, amt) => {
  try {
    const a = toRGB(hex), b = toRGB(target);
    return toHex(a.map((v, i) => v + (b[i] - v) * amt));
  } catch { return hex; }
};
export const deriveShade = hex => mixTo(hex, '#000000', 0.28);
export const deriveLight = hex => mixTo(hex, '#FFFFFF', 0.24);

const NEUTRAL = { name: 'بلا لون', hex: '#6E7278', shade: '#53575C', light: '#8E9298' };

/* ============ مكتبة صور الموديل ============ */
/* الصور المدمجة اثنتا عشرة من Freepik، والمرفوعة تُخزَّن كـ data URL.
   المفتاح هو ما تشير إليه `models` في المنتجات، فلا يُعاد استعماله. */
function buildPhotos(ov) {
  return { ...PHOTOS, ...(ov.photos || {}) };
}
export const isBuiltinPhoto = key => Object.prototype.hasOwnProperty.call(PHOTOS, key);

function buildColorways(ov) {
  const out = {};
  Object.keys(COLORWAYS).forEach(k => { out[k] = COLORWAYS[k]; });
  const edits = ov.colors || {};
  Object.keys(edits).forEach(k => {
    const base = out[k] || {};
    const e = edits[k];
    const hex = e.hex || base.hex;
    out[k] = {
      name: e.name !== undefined ? e.name : (base.name || k),
      hex,
      /* تغيير hex دون shade/light صريحين يعيد اشتقاقهما من اللون الجديد */
      shade: e.shade || (e.hex ? deriveShade(hex) : base.shade) || deriveShade(hex),
      light: e.light || (e.hex ? deriveLight(hex) : base.light) || deriveLight(hex)
    };
  });
  return out;
}

const merge = (base, ov) => (ov ? { ...base, ...ov } : base);

const ContentCtx = createContext(null);

const PUB_KEY = 'vitas.content.v1';
const DRAFT_KEY = 'vitas.content.draft.v1';
const PREVIEW_KEY = 'vitas.preview';

function readKey(key) {
  try {
    const raw = localStorage.getItem(key);
    const v = raw ? JSON.parse(raw) : null;
    return v && typeof v === 'object' ? v : null;
  } catch { return null; }
}

/* عارض مشتق من مجموعة فروق واحدة. يُستدعى مرّتين:
   مرّة للواجهة (منشور أو مسودّة حسب وضع المعاينة) ومرّة للوحة (مسودّة دائماً). */
function makeView(ov) {
  const cw = buildColorways(ov);
  const ph = buildPhotos(ov);
  const added = Array.isArray(ov.added) ? ov.added : [];
  const addedProducts = added.filter(x => x.kind !== 'edition');
  const addedEditions = added.filter(x => x.kind === 'edition');
  const basePlus = (base, extra) =>
    [...base.map(p => merge(p, ov.products && ov.products[p.code])),
     ...extra.map(p => merge(p, ov.products && ov.products[p.code]))];

  return {
    /* النصّ الفارغ يبقى فارغاً عمداً — وزرّ الاسترجاع بجانبه يعيد الافتراضي. */
    t: key => {
      const o = ov.texts && ov.texts[key];
      return o !== undefined ? o : (TEXTS[key] ? TEXTS[key].value : '');
    },
    isEdited: key => !!(ov.texts && ov.texts[key] !== undefined),

    isVisible: id => {
      const o = ov.sections && ov.sections[id];
      return o === undefined ? true : !!o;
    },

    findProduct: code => {
      const base = [...PRODUCTS, ...EDITIONS, ...added].find(x => x.code === code);
      return base ? merge(base, ov.products && ov.products[code]) : null;
    },
    products: basePlus(PRODUCTS, addedProducts).filter(p => !p.hidden),
    editions: basePlus(EDITIONS, addedEditions).filter(e => !e.hidden),
    allCatalog: basePlus([...PRODUCTS, ...EDITIONS], added),
    added,
    isAdded: code => added.some(a => a.code === code),
    isEdition: code => EDITIONS.some(e => e.code === code) ||
                       added.some(a => a.code === code && a.kind === 'edition'),
    isProductEdited: code => !!(ov.products && ov.products[code] &&
                                Object.keys(ov.products[code]).length),

    /* جدول المقاسات: الصفوف تُستبدل كاملةً — تتبّع الفروق خليّةً خليّة لا يستحق. */
    sizeRows: Array.isArray(ov.sizes) ? ov.sizes : DEFAULT_SIZES,
    isSizesEdited: Array.isArray(ov.sizes),

    fabricRows: Array.isArray(ov.fabric) ? ov.fabric : DEFAULT_FABRIC,
    isFabricEdited: Array.isArray(ov.fabric),

    photos: ph,
    /* لا يُرجع undefined: مفتاح صورة محذوف من منتج قائم يجب أن يُسقَط بهدوء. */
    photo: key => ph[key] || null,
    isPhotoAdded: key => !isBuiltinPhoto(key),

    colorways: cw,
    /* لا يُرجع undefined أبداً: مفتاح لون محفوظ في سلّة أو طلب قديم
       يجب أن يعرض شيئاً لا أن يُسقط الصفحة. */
    colorway: key => cw[key] || { ...NEUTRAL, name: key || NEUTRAL.name },
    isColorEdited: key => !!(ov.colors && ov.colors[key]),
    isColorAdded: key => !COLORWAYS[key]
  };
}

export function ContentProvider({ children }) {
  const [published, setPublished] = useState(() => readKey(PUB_KEY) || {});
  /* المسودّة تبدأ من المنشور لا من الفراغ: البدء فارغاً يُظهر الافتراضيات في
     اللوحة بينما الموقع يعرض التعديلات، وأوّل حفظ يمحوها. */
  const [draft, setDraft] = useState(() => readKey(DRAFT_KEY) || readKey(PUB_KEY) || {});
  const [storageError, setStorageError] = useState('');
  const [preview, setPreviewState] = useState(() => {
    try { return sessionStorage.getItem(PREVIEW_KEY) === '1'; } catch { return false; }
  });

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setStorageError('');
    } catch (e) {
      /* الابتلاع الصامت هنا يبدو للمستخدم كأن الصورة «اختفت». */
      setStorageError(e && e.name === 'QuotaExceededError'
        ? 'امتلأ تخزين المتصفّح — لم تُحفظ المسودّة. احذف صوراً مرفوعة أو صدّر الإعدادات ثم استرجع الكل.'
        : 'تعذّر حفظ المسودّة في المتصفّح.');
    }
  }, [draft]);

  const setPreview = on => {
    setPreviewState(on);
    try { on ? sessionStorage.setItem(PREVIEW_KEY, '1') : sessionStorage.removeItem(PREVIEW_KEY); }
    catch { /* لا شيء */ }
  };

  const api = useMemo(() => {
    const live = makeView(preview ? draft : published);
    const dv = makeView(draft);

    const patch = fn => setDraft(s => fn(s));

    return {
      ...live,
      preview, setPreview, storageError,
      /* عارض المسودّة للمعاينة المدمجة داخل اللوحة — مستقلّ عن وضع المعاينة العام */
      draftView: dv,
      hasChanges: JSON.stringify(draft) !== JSON.stringify(published),

      /* اللوحة تحرّر المسودّة دائماً، بمعزل عن وضع المعاينة. */
      draft: {
        ...dv,
        setText: (key, value) => patch(s => ({ ...s, texts: { ...(s.texts || {}), [key]: value } })),
        resetText: key => patch(s => {
          const t = { ...(s.texts || {}) }; delete t[key];
          return { ...s, texts: t };
        }),
        setVisible: (id, on) => patch(s => ({ ...s, sections: { ...(s.sections || {}), [id]: on } })),
        setProductField: (code, key, value) => patch(s => ({
          ...s, products: { ...(s.products || {}), [code]: { ...((s.products || {})[code] || {}), [key]: value } }
        })),
        resetProduct: code => patch(s => {
          const p = { ...(s.products || {}) }; delete p[code];
          return { ...s, products: p };
        }),
        setSizes: rows => patch(s => ({ ...s, sizes: rows })),
        resetSizes: () => patch(s => { const n = { ...s }; delete n.sizes; return n; }),

        setFabric: rows => patch(s => ({ ...s, fabric: rows })),
        resetFabric: () => patch(s => { const n = { ...s }; delete n.fabric; return n; }),

        setColorField: (key, field, value) => patch(s => ({
          ...s, colors: { ...(s.colors || {}), [key]: { ...((s.colors || {})[key] || {}), [field]: value } }
        })),
        resetColor: key => patch(s => {
          const c = { ...(s.colors || {}) }; delete c[key];
          return { ...s, colors: c };
        }),
        addColor: (key, name, hex) => patch(s => ({
          ...s, colors: { ...(s.colors || {}), [key]: { name, hex } }
        })),

        addPhoto: (key, entry) => patch(s => ({
          ...s, photos: { ...(s.photos || {}), [key]: entry }
        })),
        setPhotoField: (key, field, value) => patch(s => ({
          ...s, photos: { ...(s.photos || {}), [key]: { ...((s.photos || {})[key] || {}), [field]: value } }
        })),
        /* الحذف للمرفوعة فقط. المنتج الذي كان يشير إليها يسقطها بهدوء
           عبر مرشّح galleryShots ولا ينكسر. */
        removePhoto: key => patch(s => {
          const p = { ...(s.photos || {}) }; delete p[key];
          return { ...s, photos: p };
        }),
        setModels: (code, fit, keys) => patch(s => {
          const cur = (s.products || {})[code] || {};
          const base = [...PRODUCTS, ...EDITIONS, ...(s.added || [])].find(x => x.code === code);
          const models = { ...((base && base.models) || {}), ...(cur.models || {}), [fit]: keys };
          return { ...s, products: { ...(s.products || {}), [code]: { ...cur, models } } };
        }),

        /* منتج جديد لا أصل له في الشيفرة، فيُخزَّن كاملاً في قائمة مستقلّة. */
        addItem: item => patch(s => ({ ...s, added: [...(Array.isArray(s.added) ? s.added : []), item] })),
        updateAdded: (code, fields) => patch(s => ({
          ...s, added: (s.added || []).map(a => (a.code === code ? { ...a, ...fields } : a))
        })),
        removeAdded: code => patch(s => ({
          ...s, added: (s.added || []).filter(a => a.code !== code)
        })),
        resetAll: () => setDraft({})
      },

      publish: () => {
        try {
          localStorage.setItem(PUB_KEY, JSON.stringify(draft));
          setPublished(draft);
          setStorageError('');
        } catch (e) {
          setStorageError('امتلأ تخزين المتصفّح — لم يُنشر شيء. احذف صوراً مرفوعة أوّلاً.');
        }
      },
      discard: () => setDraft(published),

      exportJSON: () => JSON.stringify(draft, null, 2),
      importJSON: text => {
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== 'object') throw new Error('صيغة غير صالحة');
        setDraft({
          texts: parsed.texts || {},
          sections: parsed.sections || {},
          products: parsed.products || {},
          sizes: Array.isArray(parsed.sizes) ? parsed.sizes : undefined,
          fabric: Array.isArray(parsed.fabric) ? parsed.fabric : undefined,
          colors: parsed.colors || {},
          added: Array.isArray(parsed.added) ? parsed.added : [],
          photos: parsed.photos || {}
        });
      }
    };
  }, [published, draft, preview, storageError]);

  return <ContentCtx.Provider value={api}>{children}</ContentCtx.Provider>;
}

export const useContent = () => useContext(ContentCtx);

/* يفرض بيانات المسودّة على شجرته الفرعية مهما كان وضع المعاينة العام.
   يستعمله لوح المعاينة داخل اللوحة ليعرض ما تحرّره الآن لا ما هو منشور. */
export function DraftScope({ children }) {
  const api = useContent();
  const scoped = useMemo(() => ({ ...api, ...api.draftView }), [api]);
  return <ContentCtx.Provider value={scoped}>{children}</ContentCtx.Provider>;
}
