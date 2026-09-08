import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button, Tabs, Switch, Table, TextField, TextArea, Input, Label, Chip, Separator,
  ToggleButton, ToggleButtonGroup
} from '@heroui/react';
import { SECTIONS, TEXTS, SIZE_COLS, FABRIC_COLS, deriveShade, deriveLight, useContent, DraftScope } from '../lib/content';
import { Home } from './Home';
import { ItemEditor } from '../components/ItemEditor';
import { downscaleImage, fmtBytes, MAX_EDGE } from '../lib/image';
import { readOrders, setStatus, removeOrder, STATUSES, statusOf, fmtDate } from '../lib/orders';
import { money, price } from '../lib/format';
import { Garment } from '../lib/garments';
import { FITS } from '../data/catalog';
import { href } from '../lib/router';

const wrap = 'mx-auto max-w-[1280px] px-[clamp(1.15rem,4vw,3.25rem)]';

/* ============ تبويب النصوص ============ */
/* صفّ التحرير خارج المكوّن الأب: تعريفه داخل دالة العرض يعيد تركيبه
   مع كل ضغطة مفتاح فيفقد الحقل التركيز. */
function TextRow({ id, meta, value, edited, onChange, onReset }) {
  return (
    <div className="border-b border-[var(--border)] py-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm text-ink-soft">{id}</span>
        {edited && <Chip size="sm" className="bg-marker text-white">معدّل</Chip>}
        {edited && (
          <Button size="sm" variant="ghost" className="ms-auto text-marker" onPress={onReset}>
            استرجاع الأصلي
          </Button>
        )}
      </div>
      <TextField className="w-full" value={value} onChange={onChange}>
        <Label>{meta.label}</Label>
        {meta.multiline
          ? <TextArea rows={3} className="min-h-24" />
          : <Input />}
      </TextField>
    </div>
  );
}

function TextsTab({ sec, setSec }) {
  const c = useContent().draft;
  const keys = Object.keys(TEXTS).filter(k => TEXTS[k].section === sec);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {SECTIONS.map(s => (
          <Button key={s.id} size="sm" variant={sec === s.id ? undefined : 'outline'}
                  onPress={() => setSec(s.id)}>
            {s.label}
          </Button>
        ))}
      </div>
      {keys.map(k => (
        <TextRow key={k} id={k} meta={TEXTS[k]} value={c.t(k)} edited={c.isEdited(k)}
                 onChange={v => c.setText(k, v)} onReset={() => c.resetText(k)} />
      ))}
    </div>
  );
}

/* ============ تبويب الأقسام ============ */
function SectionsTab() {
  const c = useContent().draft;
  return (
    <div>
      <p className="mb-6 max-w-[60ch] text-ink-soft">
        إخفاء قسم يزيله من الصفحة الرئيسية ويزيل رابطه من الترويسة والتذييل معاً،
        فلا يبقى رابط يقود إلى فراغ.
      </p>
      {SECTIONS.map(s => (
        <div key={s.id}
             className="flex items-center justify-between gap-4 border-b border-[var(--border)] py-4">
          <div>
            <div className="font-medium">{s.label}</div>
            <div className="font-mono text-sm text-ink-soft">
              #{s.id}{s.nav ? ` · رابط الترويسة: ${s.nav}` : ' · لا رابط في الترويسة'}
            </div>
          </div>
          {/* Switch.Control يجب أن يقع **داخل** Switch.Content:
              خارجه يبقى شريط المفتاح خارج الـ label فلا يستجيب للنقر إطلاقاً.
              و min-h يرفع منطقة النقر إلى الحدّ الأدنى المطلوب. */}
          <Switch isSelected={c.isVisible(s.id)} onChange={on => c.setVisible(s.id, on)}>
            <Switch.Content className="min-h-11 flex-row-reverse items-center gap-3">
              <Switch.Control className="min-h-6"><Switch.Thumb /></Switch.Control>
              {c.isVisible(s.id) ? 'ظاهر' : 'مخفي'}
            </Switch.Content>
          </Switch>
        </div>
      ))}
    </div>
  );
}

/* ============ تبويب الكتالوج ============ */
/* الصفّ خارج المكوّن الأب — التعريف داخل دالة العرض يُفقد التركيز مع كل حرف. */
function CatalogRow({ item, colorway, isAdded, onEdit, onToggle, onReset, onDelete, edited }) {
  const c = colorway(item.colors ? item.colors[0] : item.color);
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] py-3">
      <span className="w-12 shrink-0 bg-paper-2 p-1">
        <Garment type={item.type} color={c} fit="width" />
      </span>
      <div className="min-w-[14ch] flex-1">
        <div className="font-medium">{item.name || '—'}</div>
        <div className="font-mono text-sm text-ink-soft" dir="ltr">{item.code}</div>
      </div>
      <span className="font-mono tnum">{price(item.price || 0)}</span>
      {edited && <Chip size="sm" className="bg-marker text-white">معدّل</Chip>}
      {isAdded && <Chip size="sm" className="bg-blueprint text-white">مضاف</Chip>}

      <Switch isSelected={!item.hidden} onChange={on => onToggle(!on)}>
        <Switch.Content className="min-h-11 flex-row-reverse items-center gap-3">
          <Switch.Control className="min-h-6"><Switch.Thumb /></Switch.Control>
          {item.hidden ? 'مخفي' : 'معروض'}
        </Switch.Content>
      </Switch>

      <Button size="sm" variant="outline" onPress={onEdit}>تعديل</Button>
      {isAdded
        ? <Button size="sm" variant="ghost" className="text-marker" onPress={onDelete}>حذف</Button>
        : edited && <Button size="sm" variant="ghost" className="text-marker" onPress={onReset}>استرجاع</Button>}
    </div>
  );
}

function CatalogTab() {
  const c = useContent().draft;
  const [kind, setKind] = useState('products');
  const [editing, setEditing] = useState(null);   // {mode, kind, item}
  const list = c.allCatalog.filter(x => (kind === 'products') !== c.isEdition(x.code));
  const takenCodes = c.allCatalog.map(x => x.code);

  const saveItem = out => {
    if (editing.mode === 'add') {
      c.addItem({ ...out, kind: kind === 'editions' ? 'edition' : 'product' });
    } else if (c.isAdded(out.code)) {
      c.updateAdded(out.code, out);
    } else {
      /* قطعة من الشيفرة: نحفظ الفروق فقط لا نسخة كاملة */
      Object.keys(out).forEach(k => {
        if (k !== 'code' && k !== 'kind') c.setProductField(out.code, k, out[k]);
      });
    }
    setEditing(null);
  };

  return (
    <div>
      <p className="mb-5 max-w-[62ch] text-ink-soft">
        التعديل والإضافة يفتحان نافذة بكل الحقول. القطعة المخفيّة تختفي من الشبكة
        وتصبح صفحتها «لم نجد هذه القطعة».
      </p>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Button size="sm" variant={kind === 'products' ? undefined : 'outline'}
                onPress={() => setKind('products')}>المجموعة الأساسية</Button>
        <Button size="sm" variant={kind === 'editions' ? undefined : 'outline'}
                onPress={() => setKind('editions')}>الإصدارات الخاصة</Button>
        <Button size="sm" className="ms-auto"
                onPress={() => setEditing({ mode: 'add', kind: kind === 'editions' ? 'edition' : 'product', item: null })}>
          {kind === 'editions' ? 'إضافة إصدار' : 'إضافة منتج'}
        </Button>
      </div>

      {list.map(item => (
        <CatalogRow key={item.code} item={item} colorway={c.colorway}
                    isAdded={c.isAdded(item.code)} edited={c.isProductEdited(item.code)}
                    onEdit={() => setEditing({ mode: 'edit',
                      kind: c.isEdition(item.code) ? 'edition' : 'product', item })}
                    onToggle={v => c.setProductField(item.code, 'hidden', v)}
                    onReset={() => c.resetProduct(item.code)}
                    onDelete={() => { if (confirm(`حذف ${item.name || item.code} من الكتالوج؟`)) c.removeAdded(item.code); }} />
      ))}

      {editing && (
        <ItemEditor open mode={editing.mode} kind={editing.kind} item={editing.item}
                    colorways={c.colorways} photos={c.photos} takenCodes={takenCodes}
                    onSave={saveItem} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

/* ============ تبويب بطاقات القماش ============ */
function FabricCell({ value, onChange, label, multiline }) {
  return (
    <TextField className="w-full" value={value} onChange={onChange}>
      <Label className="sr-only">{label}</Label>
      {multiline ? <TextArea rows={2} className="min-h-20" /> : <Input />}
    </TextField>
  );
}

function FabricTab() {
  const c = useContent().draft;
  const rows = c.fabricRows;
  const setCell = (ri, ci, v) =>
    c.setFabric(rows.map((r, i) => (i === ri ? r.map((cell, j) => (j === ci ? v : cell)) : r)));

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <p className="max-w-[52ch] text-ink-soft">
          البطاقات الأربع في قسم «ورقة القماش». الرمز يظهر بلون المخطّطات فوق العنوان.
        </p>
        <div className="ms-auto flex gap-2">
          <Button size="sm" variant="outline"
                  onPress={() => c.setFabric([...rows, ['', '', '']])}>إضافة بطاقة</Button>
          {c.isFabricEdited && (
            <Button size="sm" variant="ghost" className="text-marker" onPress={c.resetFabric}>
              استرجاع الأصلي
            </Button>
          )}
        </div>
      </div>

      {rows.map((row, ri) => (
        <div key={ri} className="mb-4 border-b border-[var(--border)] pb-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-mono text-sm text-ink-soft">بطاقة {ri + 1}</span>
            <Button size="sm" variant="ghost" className="ms-auto text-marker"
                    onPress={() => c.setFabric(rows.filter((_, i) => i !== ri))}
                    aria-label={`حذف بطاقة ${ri + 1}`}>حذف</Button>
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
            <FabricCell value={row[0]} label={`${FABRIC_COLS[0]} — بطاقة ${ri + 1}`}
                        onChange={v => setCell(ri, 0, v)} />
            <FabricCell value={row[1]} label={`${FABRIC_COLS[1]} — بطاقة ${ri + 1}`}
                        onChange={v => setCell(ri, 1, v)} />
            <div className="md:col-span-2">
              <FabricCell value={row[2]} label={`${FABRIC_COLS[2]} — بطاقة ${ri + 1}`}
                          multiline onChange={v => setCell(ri, 2, v)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============ تبويب الصور ============ */
/* صفّ المكتبة خارج المكوّن الأب — التعريف داخل العرض يُفقد التركيز مع كل حرف. */
function PhotoRow({ id, entry, added, usedBy, colorways, onField, onRemove }) {
  return (
    <div className="flex flex-wrap items-start gap-3 border-b border-[var(--border)] py-4">
      <img src={entry.src} alt="" loading="lazy"
           className="h-[88px] w-[68px] shrink-0 border border-[var(--border)] bg-paper-2 object-cover" />

      <div className="min-w-[18ch] flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm text-ink-soft" dir="ltr">{id}</span>
          {added
            ? <Chip size="sm" className="bg-blueprint text-white">مرفوعة</Chip>
            : <Chip size="sm" variant="secondary">مدمجة</Chip>}
          <span className="font-mono text-sm text-ink-soft">
            {usedBy.length ? `مستعملة في ${usedBy.join('، ')}` : 'غير مستعملة'}
          </span>
          {added && (
            <Button size="sm" variant="ghost" className="ms-auto text-marker"
                    onPress={onRemove}>حذف</Button>
          )}
        </div>

        <TextField className="w-full" value={entry.alt || ''} onChange={v => onField('alt', v)}>
          <Label>الوصف البديل</Label>
          <TextArea rows={2} className="min-h-16" />
        </TextField>

        <div>
          <span className="mb-2 block font-medium">اللون الظاهر في الصورة</span>
          <ToggleButtonGroup aria-label={`لون الصورة ${id}`} selectionMode="single"
            selectedKeys={entry.color ? [entry.color] : []}
            onSelectionChange={ks => { const v = [...ks][0]; if (v) onField('color', v); }}
            className="flex flex-wrap gap-2">
            {Object.keys(colorways).map(k => (
              <ToggleButton key={k} id={colorways[k].name} className="text-sm">
                <span className="me-2 inline-block size-3 rounded-full align-middle"
                      style={{ background: colorways[k].hex }} />
                {colorways[k].name}
              </ToggleButton>
            ))}
            <ToggleButton id="أبيض" className="text-sm">أبيض</ToggleButton>
          </ToggleButtonGroup>
        </div>
      </div>
    </div>
  );
}

function PhotosTab() {
  const c = useContent().draft;
  const fileRef = useRef(null);
  const [pending, setPending] = useState(null);   // {dataUrl, bytes, width, height}
  const [alt, setAlt] = useState('');
  const [color, setColor] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const keys = Object.keys(c.photos);
  const colorNames = [...Object.keys(c.colorways).map(k => c.colorways[k].name), 'أبيض'];

  /* أي منتج يستعمل كل صورة — الحذف بلا هذه المعلومة عمل أعمى. */
  const usage = {};
  c.allCatalog.forEach(p => {
    ['men', 'women'].forEach(fit => {
      ((p.models && p.models[fit]) || []).forEach(k => {
        usage[k] = usage[k] || [];
        if (!usage[k].includes(p.code)) usage[k].push(p.code);
      });
    });
  });

  const pick = e => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true); setErr('');
    downscaleImage(file)
      .then(res => { setPending(res); setBusy(false); })
      .catch(ex => { setErr(ex.message); setBusy(false); });
  };

  const save = () => {
    if (!pending) return setErr('اختر ملف صورة أولاً.');
    /* الوصف البديل شرط لا تحسين: المعرض يعرضه، وتدقيق الوصولية يفحصه. */
    if (alt.trim().length < 10) return setErr('اكتب وصفاً بديلاً واضحاً (عشرة أحرف فأكثر).');
    if (!color) return setErr('اختر اللون الظاهر في الصورة — التعليق تحت المعرض يعتمده.');
    const key = 'up-' + Date.now().toString(36);
    c.addPhoto(key, { src: pending.dataUrl, alt: alt.trim(), color });
    setPending(null); setAlt(''); setColor(''); setErr('');
  };

  return (
    <div>
      <p className="mb-5 max-w-[64ch] text-ink-soft">
        الصور المدمجة اثنتا عشرة من Freepik. الصور المرفوعة تُصغَّر إلى {MAX_EDGE} بكسل
        وتُحفظ داخل المتصفّح — وحصّة التخزين محدودة، فارفع ما تحتاجه فقط.
        الربط بالمنتجات يتم من نافذة تعديل المنتج في تبويب «الكتالوج».
      </p>

      <div className="mb-6 border border-[var(--border)] bg-paper-2 p-4">
        <h3 className="mb-3 text-lg">رفع صورة</h3>
        <div className="flex flex-wrap items-start gap-4">
          {pending && (
            <img src={pending.dataUrl} alt="معاينة الصورة المرفوعة"
                 className="h-[110px] w-[86px] border border-[var(--border)] object-cover" />
          )}
          <div className="min-w-[20ch] flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" isDisabled={busy}
                      onPress={() => fileRef.current?.click()}>
                {busy ? 'جارٍ التصغير…' : 'اختيار ملف'}
              </Button>
              <input ref={fileRef} type="file" accept="image/*" className="sr-only"
                     aria-label="ملف الصورة" onChange={pick} />
              {pending && (
                <span className="font-mono text-sm text-ink-soft">
                  {pending.width}×{pending.height} · {fmtBytes(pending.bytes)}
                </span>
              )}
            </div>

            <TextField className="w-full" value={alt} onChange={setAlt}>
              <Label>الوصف البديل</Label>
              <TextArea rows={2} className="min-h-16"
                        placeholder="مثال: ممرّضة بقميص سكراب أخضر جراحي، لقطة أمامية" />
            </TextField>

            <div>
              <span className="mb-2 block font-medium">اللون الظاهر في الصورة</span>
              <ToggleButtonGroup aria-label="لون الصورة الجديدة" selectionMode="single"
                selectedKeys={color ? [color] : []}
                onSelectionChange={ks => { const v = [...ks][0]; if (v) setColor(v); }}
                className="flex flex-wrap gap-2">
                {colorNames.map(n => (
                  <ToggleButton key={n} id={n} className="text-sm">{n}</ToggleButton>
                ))}
              </ToggleButtonGroup>
            </div>

            <Button onPress={save} isDisabled={!pending}>إضافة إلى المكتبة</Button>
            <p role="status" className="min-h-5 text-sm font-medium text-marker">{err}</p>
          </div>
        </div>
      </div>

      {keys.map(k => (
        <PhotoRow key={k} id={k} entry={c.photos[k]} added={c.isPhotoAdded(k)}
                  usedBy={usage[k] || []} colorways={c.colorways}
                  onField={(field, v) => c.setPhotoField(k, field, v)}
                  onRemove={() => {
                    const used = usage[k] || [];
                    const msg = used.length
                      ? `هذه الصورة مستعملة في ${used.join('، ')}. حذفها يزيلها من معرضها. متابعة؟`
                      : 'حذف الصورة من المكتبة؟';
                    if (confirm(msg)) c.removePhoto(k);
                  }} />
      ))}
    </div>
  );
}

/* ============ تبويب الألوان ============ */
function ColorRow({ id, cw, edited, added, onField, onReset }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] py-3">
      <span className="size-10 shrink-0 rounded-full border border-[var(--border)]"
            style={{ background: cw.hex }} aria-hidden="true" />
      <div className="flex gap-1" aria-hidden="true">
        <span className="size-5 rounded-sm" style={{ background: cw.shade }} />
        <span className="size-5 rounded-sm" style={{ background: cw.light }} />
      </div>
      <TextField className="min-w-[12ch] flex-1" value={cw.name}
                 onChange={v => onField('name', v)}>
        <Label className="sr-only">اسم اللون {id}</Label>
        <Input />
      </TextField>
      <TextField className="w-[13ch]" value={cw.hex}
                 onChange={v => onField('hex', v.toUpperCase())}>
        <Label className="sr-only">قيمة اللون {id}</Label>
        <Input dir="ltr" className="font-mono" />
      </TextField>
      <span className="font-mono text-sm text-ink-soft" dir="ltr">{id}</span>
      {added && <Chip size="sm" className="bg-blueprint text-white">مضاف</Chip>}
      {edited && !added && (
        <Button size="sm" variant="ghost" className="text-marker" onPress={onReset}>استرجاع</Button>
      )}
    </div>
  );
}

function ColorsTab() {
  const c = useContent().draft;
  const [newKey, setNewKey] = useState('');
  const [newName, setNewName] = useState('');
  const [newHex, setNewHex] = useState('#7A5C3E');
  const [err, setErr] = useState('');
  const keys = Object.keys(c.colorways);

  const add = () => {
    const k = newKey.trim().toLowerCase();
    if (!/^[a-z][a-z0-9-]{1,20}$/.test(k)) return setErr('المفتاح بالإنجليزية الصغيرة، حرفان فأكثر. مثل mint.');
    if (keys.includes(k)) return setErr('هذا المفتاح مستعمل.');
    if (!newName.trim()) return setErr('اكتب اسم اللون بالعربية.');
    if (!/^#[0-9A-Fa-f]{6}$/.test(newHex)) return setErr('قيمة اللون بصيغة #RRGGBB.');
    setErr(''); c.addColor(k, newName.trim(), newHex.toUpperCase());
    setNewKey(''); setNewName('');
  };

  return (
    <div>
      <p className="mb-5 max-w-[64ch] text-ink-soft">
        اللون يقود رسوم القطع كلها. تغيير القيمة وحدها يعيد اشتقاق الظلّ والفاتح
        منها تلقائياً — المربّعان الصغيران بجانب الدائرة يريانك النتيجة.
        <strong className="text-ink"> الحذف غير متاح</strong>: السلال والطلبات المحفوظة
        تشير إلى اللون بمفتاحه، وحذفه يكسر عرضها.
      </p>

      <div className="mb-6 border border-[var(--border)] bg-paper-2 p-4">
        <h3 className="mb-3 text-lg">إضافة لون</h3>
        <div className="grid items-end gap-3 md:grid-cols-[10rem_1fr_9rem_auto]">
          <TextField className="w-full" value={newKey} onChange={setNewKey}>
            <Label>المفتاح</Label><Input dir="ltr" className="font-mono" placeholder="mint" />
          </TextField>
          <TextField className="w-full" value={newName} onChange={setNewName}>
            <Label>الاسم بالعربية</Label><Input placeholder="نعناعي" />
          </TextField>
          <TextField className="w-full" value={newHex} onChange={v => setNewHex(v.toUpperCase())}>
            <Label>القيمة</Label><Input dir="ltr" className="font-mono" />
          </TextField>
          <Button onPress={add}>إضافة</Button>
        </div>
        <p role="status" className="mt-2 min-h-5 text-sm font-medium text-marker">{err}</p>
      </div>

      {keys.map(k => (
        <ColorRow key={k} id={k} cw={c.colorways[k]}
                  edited={c.isColorEdited(k)} added={c.isColorAdded(k)}
                  onField={(field, v) => c.setColorField(k, field, v)}
                  onReset={() => c.resetColor(k)} />
      ))}
    </div>
  );
}

/* ============ تبويب المقاسات ============ */
function SizeCell({ value, onChange, label }) {
  return (
    <TextField className="w-full" value={value} onChange={onChange} aria-label={label}>
      <Label className="sr-only">{label}</Label>
      <Input className="text-center" />
    </TextField>
  );
}

function SizesTab() {
  const c = useContent().draft;
  const rows = c.sizeRows;

  const setCell = (ri, ci, v) => {
    const next = rows.map((r, i) => (i === ri ? r.map((cell, j) => (j === ci ? v : cell)) : r));
    c.setSizes(next);
  };
  const addRow = () => c.setSizes([...rows, SIZE_COLS.map(() => '')]);
  const delRow = ri => c.setSizes(rows.filter((_, i) => i !== ri));

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <p className="max-w-[52ch] text-ink-soft">
          قياسات الجسم بالسنتيمتر كما تظهر في قسم المقاسات. الجدول واحد للقَصّتين.
        </p>
        <div className="ms-auto flex gap-2">
          <Button size="sm" variant="outline" onPress={addRow}>إضافة صفّ</Button>
          {c.isSizesEdited && (
            <Button size="sm" variant="ghost" className="text-marker" onPress={c.resetSizes}>
              استرجاع الأصلي
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="mb-2 grid gap-2 [grid-template-columns:repeat(5,1fr)_auto] font-mono text-sm text-ink-soft">
            {SIZE_COLS.map(h => <span key={h} className="px-1">{h}</span>)}
            <span className="w-16" />
          </div>
          {rows.map((row, ri) => (
            <div key={ri} className="mb-2 grid items-center gap-2 [grid-template-columns:repeat(5,1fr)_auto]">
              {row.map((cell, ci) => (
                <SizeCell key={ci} value={cell} label={`${SIZE_COLS[ci]} — صفّ ${ri + 1}`}
                          onChange={v => setCell(ri, ci, v)} />
              ))}
              <Button size="sm" variant="ghost" className="w-16 text-marker"
                      onPress={() => delRow(ri)}
                      aria-label={`حذف صفّ ${row[0] || ri + 1}`}>حذف</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============ تبويب الطلبيات ============ */
function OrdersTab() {
  const [orders, setOrders] = useState(readOrders);
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(null);

  const shown = useMemo(
    () => (filter === 'all' ? orders : orders.filter(o => o.status === filter)),
    [orders, filter]);

  const revenue = orders.filter(o => o.status !== 'cancelled')
                        .reduce((s, o) => s + (o.total || 0), 0);

  const counts = STATUSES.map(s => ({ ...s, n: orders.filter(o => o.status === s.id).length }));

  if (!orders.length) {
    return (
      <div className="py-16 text-center">
        <h3 className="text-xl">لا توجد طلبات بعد</h3>
        <p className="mt-2 text-ink-soft">
          الطلبات المسجّلة من صفحة إتمام الطلب تظهر هنا. لا خادم — هذه طلبات هذا المتصفّح.
        </p>
      </div>
    );
  }

  const detail = open && orders.find(o => o.number === open);

  return (
    <div>
      <div className="mb-6 grid gap-px bg-[var(--border)] [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
        <div className="bg-paper p-4">
          <div className="font-mono text-2xl font-semibold tnum">{money(orders.length)}</div>
          <div className="text-sm text-ink-soft">إجمالي الطلبات</div>
        </div>
        <div className="bg-paper p-4">
          <div className="font-mono text-2xl font-semibold tnum">{price(revenue)}</div>
          <div className="text-sm text-ink-soft">قيمة الطلبات غير الملغاة</div>
        </div>
        {counts.filter(s => s.n).map(s => (
          <div key={s.id} className="bg-paper p-4">
            <div className="font-mono text-2xl font-semibold tnum">{money(s.n)}</div>
            <div className="text-sm text-ink-soft">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Button size="sm" variant={filter === 'all' ? undefined : 'outline'}
                onPress={() => setFilter('all')}>الكل ({money(orders.length)})</Button>
        {counts.map(s => (
          <Button key={s.id} size="sm" variant={filter === s.id ? undefined : 'outline'}
                  onPress={() => setFilter(s.id)}>{s.label} ({money(s.n)})</Button>
        ))}
      </div>

      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="الطلبات" className="min-w-[720px]">
            <Table.Header>
              <Table.Column isRowHeader>رقم الطلب</Table.Column>
              <Table.Column>التاريخ</Table.Column>
              <Table.Column>المستلِم</Table.Column>
              <Table.Column>المحافظة</Table.Column>
              <Table.Column>الإجمالي</Table.Column>
              <Table.Column>الحالة</Table.Column>
              <Table.Column>—</Table.Column>
            </Table.Header>
            <Table.Body>
              {shown.map(o => (
                <Table.Row key={o.number}>
                  <Table.Cell><span dir="ltr" className="font-mono">{o.number}</span></Table.Cell>
                  <Table.Cell><span className="font-mono text-sm tnum">{fmtDate(o.at)}</span></Table.Cell>
                  <Table.Cell>{o.customer?.name || '—'}</Table.Cell>
                  <Table.Cell>{o.customer?.gov || '—'}</Table.Cell>
                  <Table.Cell><span className="font-mono tnum">{price(o.total || 0)}</span></Table.Cell>
                  <Table.Cell>
                    <Chip size="sm" className={statusOf(o.status).tone}>{statusOf(o.status).label}</Chip>
                  </Table.Cell>
                  <Table.Cell>
                    <Button size="sm" variant="outline"
                            onPress={() => setOpen(open === o.number ? null : o.number)}>
                      {open === o.number ? 'إخفاء' : 'تفاصيل'}
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      {detail && (
        <div className="mt-6 border border-[color-mix(in_srgb,#17241F_26%,transparent)] bg-paper-2 p-[clamp(1.1rem,3vw,1.6rem)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl">طلب <span dir="ltr" className="font-mono">{detail.number}</span></h3>
            <Button size="sm" variant="ghost" onPress={() => setOpen(null)}>إغلاق</Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-mono text-sm text-ink-soft">المستلِم</h4>
              <dl className="m-0">
                {[['الاسم', detail.customer?.name],
                  ['الهاتف', <span dir="ltr" key="p">{detail.customer?.phone}</span>],
                  ['المحافظة', detail.customer?.gov],
                  ['المدينة', detail.customer?.city],
                  ['أقرب نقطة دالّة', detail.customer?.landmark],
                  ['العنوان', detail.customer?.address],
                  ['ملاحظات', detail.customer?.notes || '—'],
                  ['الدفع', detail.payment]].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-[var(--border)] py-2">
                    <dt className="shrink-0 text-sm text-ink-soft">{k}</dt>
                    <dd className="m-0 text-end text-sm">{v || '—'}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <h4 className="mb-2 font-mono text-sm text-ink-soft">القطع</h4>
              {(detail.items || []).map(i => (
                <div key={i.key} className="border-b border-[var(--border)] py-2 text-sm">
                  <div className="font-medium">{i.name}</div>
                  <div className="font-mono text-ink-soft">
                    {i.code} · {FITS[i.fit]?.name || i.fit} · {i.color} · {i.size}
                    {i.inseam ? ' · ' + i.inseam : ''} · ×{money(i.qty)}
                  </div>
                </div>
              ))}
              <dl className="mt-3">
                {[['مجموع القطع', price(detail.subtotal || 0)],
                  ['التوصيل', detail.shipping === 0 ? 'مجاني' : price(detail.shipping || 0)],
                  ['الإجمالي', price(detail.total || 0)]].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-1">
                    <dt className="text-sm text-ink-soft">{k}</dt>
                    <dd className="m-0 font-mono text-sm tnum">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <Separator className="my-5" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="me-2 text-sm text-ink-soft">تغيير الحالة:</span>
            {STATUSES.map(s => (
              <Button key={s.id} size="sm" variant={detail.status === s.id ? undefined : 'outline'}
                      onPress={() => setOrders(setStatus(detail.number, s.id))}>
                {s.label}
              </Button>
            ))}
            <Button size="sm" variant="danger" className="ms-auto"
                    onPress={() => {
                      if (confirm(`حذف الطلب ${detail.number} نهائياً؟ لا يمكن التراجع.`)) {
                        setOrders(removeOrder(detail.number));
                        setOpen(null);
                      }
                    }}>
              حذف الطلب
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ لوح المعاينة الحيّة ============ */
/* يعرض الرئيسية نفسها مبنيّةً من المسودّة، فلا حاجة لدخول وضع المعاينة.
   `zoom` لا `transform: scale` لأنه يؤثّر في التخطيط فيأخذ اللوح حجمه الحقيقي
   بدل أن يحجز عرض ١٢٨٠ بكسل ويولّد شريط تمرير أفقياً. */
const PREVIEW_W = 1280;

function LivePreview({ focus, zoom, onZoom }) {
  const boxRef = useRef(null);

  /* التبويب المفتوح يقود المعاينة إلى قسمه بدل ترك المستخدم يبحث عنه. */
  useEffect(() => {
    const box = boxRef.current;
    if (!box || !focus) return;
    const target = box.querySelector('#' + CSS.escape(focus));
    if (target) box.scrollTop = Math.max(0, target.offsetTop * zoom - 12);
    else box.scrollTop = 0;
  }, [focus, zoom]);

  return (
    <aside className="xl:sticky xl:top-24" aria-label="معاينة حيّة للمسودّة">
      <div className="flex flex-wrap items-center gap-2 border border-b-0 border-[var(--border)] bg-paper-2 px-3 py-2">
        <span className="font-mono text-sm">معاينة حيّة — المسودّة</span>
        <div className="ms-auto flex items-center gap-1">
          <Button size="sm" variant="ghost" aria-label="تصغير المعاينة"
                  onPress={() => onZoom(Math.max(0.25, +(zoom - 0.05).toFixed(2)))}>−</Button>
          <span className="w-[4.5ch] text-center font-mono text-sm tnum">
            {Math.round(zoom * 100)}٪
          </span>
          <Button size="sm" variant="ghost" aria-label="تكبير المعاينة"
                  onPress={() => onZoom(Math.min(0.9, +(zoom + 0.05).toFixed(2)))}>+</Button>
        </div>
      </div>

      <div ref={boxRef}
           className="h-[72vh] overflow-auto border border-[var(--border)] bg-paper">
        {/* inert لا aria-hidden وحده: الأخير يُخفي من قارئ الشاشة لكنه
            يترك عشرات الأزرار في ترتيب التنقّل بلوحة المفاتيح.
            inert يُخرجها من الترتيب ومن شجرة الوصولية ويمنع النقر معاً. */}
        <div className="pointer-events-none select-none" inert={true}
             style={{ width: PREVIEW_W, zoom }}>
          <DraftScope><Home inert /></DraftScope>
        </div>
      </div>

      <p className="mt-2 text-sm text-ink-soft">
        هذه المسودّة كما ستبدو بعد النشر. المتجر ما زال يعرض النسخة المنشورة.
      </p>
    </aside>
  );
}

/* ============ اللوحة ============ */
/* أي قسم من الرئيسية يخصّ كل تبويب — تُوجَّه إليه المعاينة تلقائياً.
   '' تعني: أظهر اللوح بلا تمرير إلى قسم بعينه.
   null تعني: لا معاينة (الطلبيات بيانات تشغيل لا محتوى صفحة). */
const TAB_FOCUS = { sections: '', texts: 'hero', catalog: 'collection',
                    fabric: 'fabric', colors: 'collection', photos: 'collection',
                    sizes: 'sizes', orders: null };

export function Admin() {
  const c = useContent();
  const fileRef = useRef(null);
  const [note, setNote] = useState('');
  const [tab, setTab] = useState('sections');
  const [live, setLive] = useState(true);
  const [zoom, setZoom] = useState(0.4);
  const [textSection, setTextSection] = useState('hero');

  /* تبويبا الطلبيات والأقسام لا معاينة مفيدة لهما فيُخفى اللوح تلقائياً */
  const showLive = live && TAB_FOCUS[tab] !== null && TAB_FOCUS[tab] !== undefined;
  const focus = tab === 'texts' ? textSection : TAB_FOCUS[tab];

  const doExport = () => {
    const blob = new Blob([c.exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vitas-content.json';
    a.click();
    URL.revokeObjectURL(a.href);
    setNote('نُزّل ملف الإعدادات.');
  };

  const doImport = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then(txt => {
      try { c.importJSON(txt); setNote('استُوردت الإعدادات.'); }
      catch { setNote('الملف غير صالح — لم يتغيّر شيء.'); }
    });
    e.target.value = '';
  };

  return (
    <div className={wrap + ' py-[clamp(1.5rem,4vw,2.5rem)] pb-20'}>
      <div className="mb-6">
        <div className="mb-3 font-mono text-sm tracking-widest text-marker">لوحة التحكّم</div>
        <h1 className="text-[clamp(1.9rem,1.6rem+1.5vw,3rem)]">إدارة المتجر</h1>
      </div>

      {/* حدّان جوهريان يجب أن يعرفهما من يستعمل اللوحة */}
      <div className="mb-6 border-s-4 border-blueprint bg-paper-2 px-4 py-3 leading-relaxed">
        <strong>بلا خادم وبلا تسجيل دخول.</strong> التعديلات والطلبات محفوظة في تخزين
        هذا المتصفّح وحده — الزائر يرى النصوص الافتراضية، ومن يعرف الرابط يفتح اللوحة.
        استعمل «تصدير» لنقل الإعدادات إلى جهاز آخر.
      </div>

      {/* التعديلات تبقى مسودّة حتى الحفظ — المتجر لا يتغيّر قبله. */}
      <div className={'mb-8 flex flex-wrap items-center gap-3 border p-4 ' +
        (c.hasChanges
          ? 'border-marker bg-[color-mix(in_srgb,#A63527_9%,var(--color-paper))]'
          : 'border-[var(--border)] bg-paper-2')}>
        <div className="min-w-[16ch] flex-1">
          <div className="font-medium">
            {c.hasChanges ? 'لديك تعديلات غير محفوظة' : 'لا تعديلات معلّقة'}
          </div>
          <div className="text-sm text-ink-soft">
            {c.hasChanges
              ? 'المتجر ما زال يعرض النسخة المنشورة. اضغط «حفظ ونشر» ليراها الزوّار.'
              : 'المسودّة مطابقة للمنشور.'}
          </div>
        </div>
        <Button size="sm" variant={live ? undefined : 'outline'}
                onPress={() => setLive(v => !v)}>
          {live ? 'إخفاء المعاينة الحيّة' : 'إظهار المعاينة الحيّة'}
        </Button>
        <Button size="sm" variant="outline"
                onPress={() => { c.setPreview(true); location.hash = '/'; }}>
          فتحها بحجم كامل
        </Button>
        <Button size="sm" variant="outline" isDisabled={!c.hasChanges}
                onPress={() => { if (confirm('تجاهل كل التعديلات غير المحفوظة؟')) c.discard(); }}>
          تجاهل التعديلات
        </Button>
        <Button size="sm" isDisabled={!c.hasChanges}
                onPress={() => { c.publish(); setNote('نُشرت التعديلات — المتجر يعرضها الآن.'); }}>
          حفظ ونشر
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onPress={doExport}>تصدير الإعدادات</Button>
        <Button size="sm" variant="outline" onPress={() => fileRef.current?.click()}>استيراد</Button>
        <input ref={fileRef} type="file" accept="application/json,.json"
               className="sr-only" aria-label="ملف الإعدادات" onChange={doImport} />
        <Button size="sm" variant="danger" onPress={() => {
          if (confirm('استرجاع كل شيء إلى الأصل؟ يبقى مسودّةً حتى الحفظ.')) { c.draft.resetAll(); setNote('أُعيد كل شيء إلى الأصل في المسودّة.'); }
        }}>استرجاع الكل</Button>
        <a className="ms-auto inline-block py-1.5 font-mono text-sm text-marker" href={href('/')}>عرض المتجر ←</a>
      </div>

      {c.storageError && (
        <div role="alert" className="mb-4 border-s-4 border-marker bg-[color-mix(in_srgb,#A63527_12%,var(--color-paper))] px-4 py-3 font-medium">
          {c.storageError}
        </div>
      )}
      <p role="status" aria-live="polite" className="mb-4 min-h-6 font-mono text-sm text-marker">{note}</p>

      {/* min-w-0 على عنصر الشبكة: القيمة الافتراضية auto تجعل قائمة التبويبات
          الثمانية تدفع العمود أعرض من الشاشة فيظهر تمرير أفقي على الجوال. */}
      <div className={showLive
        ? 'grid grid-cols-[minmax(0,1fr)] items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,560px)]'
        : ''}>
      <div className="min-w-0">
      <Tabs selectedKey={tab} onSelectionChange={k => setTab(String(k))}>
        <Tabs.ListContainer>
          <Tabs.List aria-label="أقسام اللوحة">
            <Tabs.Tab id="sections">الأقسام<Tabs.Indicator /></Tabs.Tab>
            <Tabs.Tab id="texts"><Tabs.Separator />النصوص<Tabs.Indicator /></Tabs.Tab>
            <Tabs.Tab id="catalog"><Tabs.Separator />الكتالوج<Tabs.Indicator /></Tabs.Tab>
            <Tabs.Tab id="fabric"><Tabs.Separator />القماش<Tabs.Indicator /></Tabs.Tab>
            <Tabs.Tab id="colors"><Tabs.Separator />الألوان<Tabs.Indicator /></Tabs.Tab>
            <Tabs.Tab id="photos"><Tabs.Separator />الصور<Tabs.Indicator /></Tabs.Tab>
            <Tabs.Tab id="sizes"><Tabs.Separator />المقاسات<Tabs.Indicator /></Tabs.Tab>
            <Tabs.Tab id="orders"><Tabs.Separator />الطلبيات<Tabs.Indicator /></Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel id="sections" className="pt-6"><SectionsTab /></Tabs.Panel>
        <Tabs.Panel id="texts" className="pt-6"><TextsTab sec={textSection} setSec={setTextSection} /></Tabs.Panel>
        <Tabs.Panel id="catalog" className="pt-6"><CatalogTab /></Tabs.Panel>
        <Tabs.Panel id="fabric" className="pt-6"><FabricTab /></Tabs.Panel>
        <Tabs.Panel id="colors" className="pt-6"><ColorsTab /></Tabs.Panel>
        <Tabs.Panel id="photos" className="pt-6"><PhotosTab /></Tabs.Panel>
        <Tabs.Panel id="sizes" className="pt-6"><SizesTab /></Tabs.Panel>
        <Tabs.Panel id="orders" className="pt-6"><OrdersTab /></Tabs.Panel>
      </Tabs>
      </div>

      {showLive && <LivePreview focus={focus} zoom={zoom} onZoom={setZoom} />}
      </div>
    </div>
  );
}
