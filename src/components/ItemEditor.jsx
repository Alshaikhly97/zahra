/* محرّر القطعة في نافذة منبثقة — للإضافة والتعديل معاً.
   حقول النموذج معرّفة في نطاق الوحدة: تعريفها داخل دالة العرض
   يعيد تركيبها مع كل ضغطة مفتاح فيضيع التركيز. */

import { useEffect, useState } from 'react';
import {
  Button, Modal, TextField, TextArea, Input, Label, Description,
  ToggleButton, ToggleButtonGroup, Switch, Chip
} from '@heroui/react';
import { Garment } from '../lib/garments';
import { FITS } from '../data/catalog';
import { price } from '../lib/format';

export const TYPES = [
  ['top', 'قميص سكراب'], ['pant', 'بنطال'], ['coat', 'معطف مختبر'],
  ['jacket', 'جاكيت'], ['underscrub', 'تحت-السكراب']
];

function Row({ label, hint, children, wide }) {
  return (
    <div className={wide ? 'md:col-span-2' : ''}>
      <span className="mb-2 block font-medium">{label}</span>
      {children}
      {hint && <p className="mt-1 text-sm text-ink-soft">{hint}</p>}
    </div>
  );
}

function Text({ label, value, onChange, hint, multiline, numeric, error, wide }) {
  return (
    /* isInvalid يُمرَّر إلى TextArea فينتهي على عنصر DOM ويطلق تحذير React —
       الخطأ يُعرض نصّاً تحت الحقل بدلاً منه. */
    <TextField className={'w-full ' + (wide ? 'md:col-span-2' : '')}
               value={value ?? ''} {...(multiline ? {} : { isInvalid: !!error })}
               onChange={v => onChange(numeric ? v.replace(/[^\d]/g, '') : v)}>
      <Label>{label}</Label>
      {multiline ? <TextArea rows={3} className="min-h-24" />
                 : <Input inputMode={numeric ? 'numeric' : undefined} />}
      {hint && <Description>{hint}</Description>}
      {error && <p className="mt-1 text-sm font-medium text-marker">{error}</p>}
    </TextField>
  );
}

/* منتقي صور الموديل لقَصّة واحدة. الترتيب يتبع ترتيب المكتبة لا ترتيب
   الاختيار: مجموعة ToggleButtonGroup تُرجع Set بلا ضمان ترتيب،
   وأوّل صورة هي اللقطة الافتراضية في المعرض. */
function PhotoPicker({ fit, photos, selected, onChange }) {
  const keys = Object.keys(photos);
  const chosen = keys.filter(k => selected.includes(k));
  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="font-medium">صور {FITS[fit].name}</span>
        <span className="font-mono text-sm text-ink-soft">
          {chosen.length ? `${chosen.length} مختارة` : 'بلا صور — يُعرض الرسم المسطّح وحده'}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {keys.map(k => {
          const on = selected.includes(k);
          return (
            <button key={k} type="button" aria-pressed={on}
              aria-label={photos[k].alt || k}
              onClick={() => onChange(keys.filter(x => (x === k ? !on : selected.includes(x))))}
              className={'relative h-[72px] w-[56px] overflow-hidden bg-paper-2 transition ' +
                (on ? 'border-2 border-ink outline outline-1 outline-offset-1 outline-marker'
                    : 'border border-[var(--border)] opacity-70 hover:opacity-100')}>
              <img src={photos[k].src} alt="" className="h-full w-full object-cover" loading="lazy" />
              {on && (
                <span className="absolute inset-x-0 bottom-0 bg-ink/85 py-0.5 text-center font-mono text-[10px] text-paper">
                  {chosen.indexOf(k) + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const blank = kind => ({
  kind, code: '', type: 'top', name: '', tagline: '', story: '', unit: '', run: '',
  price: 0, fabric: '', gsm: 0, pockets: 0, stretch: '٤ اتجاهات',
  colors: [], color: '', hidden: false,
  models: { men: [], women: [] }
});

export function ItemEditor({ open, mode, kind, item, colorways, photos, takenCodes, onSave, onClose }) {
  const isEdition = kind === 'edition';
  const [f, setF] = useState(() => item || blank(kind));
  const [errs, setErrs] = useState({});

  /* إعادة التهيئة عند تغيّر القطعة أثناء العرض بدل useEffect المتأخّر */
  const [forKey, setForKey] = useState(item ? item.code : '@new');
  const key = item ? item.code : '@new';
  if (key !== forKey) { setForKey(key); setF(item || blank(kind)); setErrs({}); }

  const set = (k, v) => { setF(s => ({ ...s, [k]: v })); setErrs(e => ({ ...e, [k]: null })); };
  const colorKeys = Object.keys(colorways);

  const validate = () => {
    const e = {};
    const code = (f.code || '').trim();
    if (mode === 'add') {
      if (!/^[A-Za-z]{2}-\d{2,3}$/.test(code)) e.code = 'الصيغة: حرفان، شرطة، رقمان. مثل VS-07.';
      /* .find() يُرجع أوّل تطابق، فرمز مكرّر يحجب الأصل بصمت. */
      else if (takenCodes.includes(code)) e.code = 'هذا الرمز مستعمل بالفعل.';
    }
    if (!(f.name || '').trim()) e.name = 'الاسم مطلوب.';
    if (!Number(f.price)) e.price = 'أدخل سعراً أكبر من صفر.';
    if (!isEdition && !(f.colors || []).length) e.colors = 'اختر لوناً واحداً على الأقل — بطاقة بلا ألوان لا تُعرض.';
    if (isEdition && !f.color) e.color = 'اختر لون الإصدار.';
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    const out = { ...f, code: (f.code || '').trim(), price: Number(f.price) || 0,
                  gsm: Number(f.gsm) || 0, pockets: Number(f.pockets) || 0,
                  models: { men: (f.models && f.models.men) || [],
                            women: (f.models && f.models.women) || [] } };
    onSave(out);
  };

  const preview = colorways[isEdition ? f.color : (f.colors || [])[0]] || colorways[colorKeys[0]];

  return (
    <Modal isOpen={open} onOpenChange={o => !o && onClose()}>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="w-[min(760px,95vw)]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="text-xl">
                {mode === 'add'
                  ? (isEdition ? 'إصدار خاص جديد' : 'منتج جديد')
                  : `تعديل ${f.name || f.code}`}
              </Modal.Heading>
            </Modal.Header>

            <Modal.Body className="max-h-[70vh] overflow-y-auto">
              <div className="mb-5 flex items-center gap-4 border-b border-[var(--border)] pb-4">
                <span className="w-16 shrink-0 bg-paper-2 p-1">
                  <Garment type={f.type} color={preview} fit="width" />
                </span>
                <div>
                  <div className="font-mono text-sm text-ink-soft" dir="ltr">{f.code || '—'}</div>
                  <div className="font-mono">{price(Number(f.price) || 0)}</div>
                </div>
                <div className="ms-auto">
                  <Switch isSelected={!f.hidden} onChange={on => set('hidden', !on)}>
                    <Switch.Content className="min-h-11 flex-row-reverse items-center gap-3">
                      <Switch.Control className="min-h-6"><Switch.Thumb /></Switch.Control>
                      {f.hidden ? 'مخفي' : 'معروض'}
                    </Switch.Content>
                  </Switch>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {mode === 'add' && (
                  <Text label="الرمز" value={f.code} onChange={v => set('code', v.toUpperCase())}
                        hint="حرفان وشرطة ورقمان، مثل VS-07" error={errs.code} />
                )}

                <Row label="نوع القطعة" hint="يحدّد الرسم الفني المستعمل">
                  <ToggleButtonGroup aria-label="نوع القطعة" selectionMode="single"
                    selectedKeys={[f.type]}
                    onSelectionChange={ks => { const v = [...ks][0]; if (v) set('type', v); }}
                    className="flex flex-wrap gap-2">
                    {TYPES.map(([id, label]) => (
                      <ToggleButton key={id} id={id} className="text-sm">{label}</ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Row>

                <Text label="الاسم" value={f.name} onChange={v => set('name', v)} error={errs.name} />
                <Text label="السعر (دينار)" value={String(f.price ?? '')} numeric
                      onChange={v => set('price', v)} error={errs.price} />

                {isEdition ? (
                  <>
                    <Text label="القسم" value={f.unit} onChange={v => set('unit', v)} />
                    <Text label="الكمية المطروحة" value={f.run} onChange={v => set('run', v)} />
                    <Text label="القصّة" value={f.story} onChange={v => set('story', v)} multiline wide />
                    <Row label="لون الإصدار" wide hint={errs.color}>
                      <ToggleButtonGroup aria-label="لون الإصدار" selectionMode="single"
                        selectedKeys={f.color ? [f.color] : []}
                        onSelectionChange={ks => { const v = [...ks][0]; if (v) set('color', v); }}
                        className="flex flex-wrap gap-2">
                        {colorKeys.map(k => (
                          <ToggleButton key={k} id={k} className="text-sm">
                            <span className="me-2 inline-block size-3 rounded-full align-middle"
                                  style={{ background: colorways[k].hex }} />
                            {colorways[k].name}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                      {errs.color && <p className="mt-1 text-sm font-medium text-marker">{errs.color}</p>}
                    </Row>
                  </>
                ) : (
                  <>
                    <Text label="الوصف" value={f.tagline} onChange={v => set('tagline', v)} multiline wide />
                    <Text label="تركيب القماش" value={f.fabric} onChange={v => set('fabric', v)} wide />
                    <Text label="الوزن (غ/م²)" value={String(f.gsm ?? '')} numeric onChange={v => set('gsm', v)} />
                    <Text label="عدد الجيوب" value={String(f.pockets ?? '')} numeric onChange={v => set('pockets', v)} />
                    <Text label="المطاطية" value={f.stretch} onChange={v => set('stretch', v)} />
                    <Row label="الألوان المتاحة" wide>
                      <ToggleButtonGroup aria-label="الألوان المتاحة" selectionMode="multiple"
                        selectedKeys={f.colors || []}
                        onSelectionChange={ks => set('colors', [...ks])}
                        className="flex flex-wrap gap-2">
                        {colorKeys.map(k => (
                          <ToggleButton key={k} id={k} className="text-sm">
                            <span className="me-2 inline-block size-3 rounded-full align-middle"
                                  style={{ background: colorways[k].hex }} />
                            {colorways[k].name}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                      {errs.colors && <p className="mt-1 text-sm font-medium text-marker">{errs.colors}</p>}
                    </Row>
                  </>
                )}
              </div>

              <div className="mt-6 border-t border-[var(--border)] pt-5">
                <h4 className="mb-1 text-lg">صور الموديل</h4>
                <p className="mb-4 text-sm leading-relaxed text-ink-soft">
                  الصور تتبع القَصّة المختارة في صفحة المنتج. أوّل صورة هي اللقطة
                  الافتراضية. أضف صوراً جديدة من تبويب «الصور» في اللوحة.
                </p>
                {['women', 'men'].map(fitKey => (
                  <PhotoPicker key={fitKey} fit={fitKey} photos={photos}
                    selected={(f.models && f.models[fitKey]) || []}
                    onChange={keys => set('models', { ...(f.models || {}), [fitKey]: keys })} />
                ))}
              </div>

              {mode === 'add' && (
                <p className="mt-5 border-s-4 border-blueprint bg-paper-2 px-3 py-2 text-sm leading-relaxed">
                  القطعة الجديدة تُعرض برسمها الفني حسب النوع، ولقطة «القطعة مسطّحة»
                  موجودة دائماً في المعرض حتى بلا صور موديل.
                </p>
              )}
            </Modal.Body>

            <Modal.Footer>
              <Button variant="outline" onPress={onClose}>إلغاء</Button>
              <Button onPress={save}>{mode === 'add' ? 'إضافة' : 'حفظ التعديل'}</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
