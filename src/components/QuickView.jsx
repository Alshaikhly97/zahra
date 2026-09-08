import { useState } from 'react';
import { Button, Drawer } from '@heroui/react';
import { Gallery } from './Gallery';
import { ProductDetail } from './ProductDetail';
import { useSelection, cartItem } from '../lib/useSelection';
import { useContent } from '../lib/content';
import { useCart } from '../lib/cart';
import { price } from '../lib/format';
import { FITS } from '../data/catalog';

export function QuickView({ code, onClose, onAdded }) {
  const { findProduct } = useContent();
  const product = code ? findProduct(code) : null;
  const [sel, set] = useSelection(product);
  const [msg, setMsg] = useState('');
  const cart = useCart();

  if (!product) return null;

  const add = () => {
    if (!sel.size) { setMsg('اختر المقاس قبل الإضافة.'); return; }
    cart.add(cartItem(product, sel));
    setMsg('');
    onClose();
    onAdded?.();
  };

  return (
    <Drawer isOpen={!!code} onOpenChange={o => !o && onClose()}>
      <Drawer.Backdrop>
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading className="text-xl">{product.name}</Drawer.Heading>
            </Drawer.Header>

            <Drawer.Body>
              <div className="mb-6">
                <Gallery product={product} fit={sel.fit} colorKey={sel.color}
                         view={sel.view} onView={v => set({ view: v })} />
              </div>
              <ProductDetail product={product} sel={sel} set={s => { set(s); setMsg(''); }} showFullLink />
            </Drawer.Body>

            <Drawer.Footer className="flex-col items-stretch gap-2">
              {/* الخطأ يقول ما الناقص — لا اعتذار ولا غموض. */}
              <p role="status" className="m-0 font-mono text-sm text-marker">{msg}</p>
              <Button className="w-full" onPress={add}>
                أضف إلى السلة — {price(product.price)}
              </Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
