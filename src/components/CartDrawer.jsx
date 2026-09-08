import { Button, Drawer, NumberField, Label } from '@heroui/react';
import { Garment } from '../lib/garments';
import { FITS } from '../data/catalog';
import { useContent } from '../lib/content';
import { money, price } from '../lib/format';
import { useCart } from '../lib/cart';
import { go } from '../lib/router';

export function CartLine({ item, compact }) {
  const cart = useCart();
  /* مفتاح اللون محفوظ في السلّة: لا نفترض بقاءه في اللوحة. */
  const { colorway } = useContent();
  const c = colorway(item.color);
  return (
    <div className="flex gap-4 border-b border-[var(--border)] py-4">
      <div className="w-[62px] shrink-0 bg-paper-2 p-1.5 [&_svg]:block [&_svg]:h-auto [&_svg]:w-full">
        <Garment type={item.type} color={c} opts={item.opts || {}} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-base">{item.name}</h3>
        <div className="font-mono text-sm text-ink-soft">
          {item.code} · {FITS[item.fit].name} · {c.name} · {item.size}
          {item.inseam ? ' · ' + item.inseam : ''}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <NumberField
            aria-label={`كمية ${item.name}`}
            value={item.qty}
            minValue={1}
            maxValue={99}
            onChange={n => cart.setQty(item.key, n)}>
            <Label className="sr-only">كمية {item.name}</Label>
            <NumberField.Group>
              <NumberField.DecrementButton />
              <NumberField.Input className="w-14 text-center tnum" />
              <NumberField.IncrementButton />
            </NumberField.Group>
          </NumberField>
          <span className="font-mono text-sm text-ink-soft tnum">{price(item.price * item.qty)}</span>
        </div>

        {!compact && (
          <Button variant="ghost" size="sm" className="mt-1 text-marker"
                  onPress={() => cart.remove(item.key)}>حذف</Button>
        )}
      </div>
    </div>
  );
}

export function CartDrawer({ isOpen, onOpenChange }) {
  const cart = useCart();
  return (
    <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Backdrop>
        {/* في صفحة RTL الاتجاه المنطقي لنهاية السطر هو اليسار */}
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading className="text-xl">السلة</Drawer.Heading>
            </Drawer.Header>

            <Drawer.Body>
              {cart.items.length === 0 ? (
                <div className="py-12 text-center">
                  <h3 className="text-xl">السلة فارغة</h3>
                  <p className="mb-6 mt-2 text-ink-soft">ابدأ من المجموعة الأساسية أو من إصدار محدود.</p>
                  <Button variant="outline" onPress={() => { onOpenChange(false); go('/#collection'); }}>
                    تصفّح المجموعة
                  </Button>
                </div>
              ) : cart.items.map(i => <CartLine key={i.key} item={i} />)}
            </Drawer.Body>

            {cart.items.length > 0 && (
              <Drawer.Footer className="flex-col items-stretch gap-3">
                <div className="flex items-baseline justify-between">
                  <span>مجموع القطع ({money(cart.count)})</span>
                  <b className="font-mono text-xl tnum">{price(cart.subtotal)}</b>
                </div>
                <Button className="w-full" onPress={() => { onOpenChange(false); go('/checkout'); }}>
                  متابعة إلى إتمام الطلب
                </Button>
              </Drawer.Footer>
            )}
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
