import { ToggleButton, ToggleButtonGroup } from '@heroui/react';
import { FITS, SIZES, INSEAMS } from '../data/catalog';
import { useContent } from '../lib/content';
import { href } from '../lib/router';

function Row({ label, children }) {
  return (
    <div className="mb-6">
      <span className="mb-2 block font-mono text-sm text-ink-soft">{label}</span>
      {children}
    </div>
  );
}

/* ToggleButtonGroup من HeroUI يتكفّل بأدوار ARIA والتنقّل بالأسهم. */
function Choice({ label, values, value, onChange }) {
  return (
    <Row label={label}>
      <ToggleButtonGroup
        aria-label={label}
        selectionMode="single"
        selectedKeys={value ? [value] : []}
        onSelectionChange={keys => {
          const v = [...keys][0];
          if (v) onChange(v);
        }}
        className="flex flex-wrap gap-2">
        {values.map(v => (
          <ToggleButton key={v} id={v} className="font-mono">{v}</ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Row>
  );
}

export function ProductDetail({ product: p, sel, set, showFullLink }) {
  const { colorway } = useContent();
  const c = colorway(sel.color);
  const colorList = p.colors || [p.color];

  return (
    <div>
      <p className="font-mono text-sm text-marker">{p.code} · {c.name}</p>
      <p className="mb-6 mt-2 leading-relaxed text-ink-soft">{p.tagline || p.story}</p>

      <Choice
        label="القَصّة"
        values={Object.keys(FITS).map(k => FITS[k].name)}
        value={FITS[sel.fit].name}
        onChange={name => set({ fit: Object.keys(FITS).find(k => FITS[k].name === name), view: 0 })} />

      {colorList.length > 1 && (
        <Choice
          label="اللون"
          values={colorList.map(k => colorway(k).name)}
          value={c.name}
          onChange={name => set({ color: colorList.find(k => colorway(k).name === name) })} />
      )}

      <Choice label="المقاس" values={SIZES} value={sel.size} onChange={v => set({ size: v })} />

      {p.inseam && (
        <Choice label="طول الساق" values={INSEAMS} value={sel.inseam} onChange={v => set({ inseam: v })} />
      )}

      {p.specs && (
        <dl className="m-0 border-t border-[var(--border)]">
          {[...p.specs, ['القماش', p.fabric]].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-[var(--border)] py-3">
              <dt className="shrink-0 text-sm text-ink-soft">{k}</dt>
              <dd className="m-0 text-end text-sm font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      {showFullLink && (
        <p className="mt-6">
          <a href={href(`/product/${p.code}`)} className="font-mono text-sm text-marker">
            الصفحة الكاملة للمنتج ←
          </a>
        </p>
      )}
    </div>
  );
}
