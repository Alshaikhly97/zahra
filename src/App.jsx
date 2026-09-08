import { useEffect, useState } from 'react';
import { CartProvider } from './lib/cart';
import { ContentProvider, useContent } from './lib/content';
import { useRoute } from './lib/router';
import { Header, Footer } from './components/Chrome';
import { Button } from '@heroui/react';
import { CartDrawer } from './components/CartDrawer';
import { Home } from './pages/Home';
import { Product } from './pages/Product';
import { Checkout } from './pages/Checkout';
import { Admin } from './pages/Admin';

/* شريط ثابت أثناء المعاينة: بلا إعلان صريح يظنّ المستخدم أن تعديلاته منشورة. */
function PreviewBar() {
  const c = useContent();
  if (!c.preview) return null;
  return (
    <div className="sticky top-0 z-[60] flex flex-wrap items-center gap-3 bg-marker px-4 py-2 text-paper">
      <strong className="text-sm">وضع المعاينة — هذه مسودّة لا يراها الزوّار</strong>
      <div className="ms-auto flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onPress={() => (location.hash = '/admin')}>
          العودة إلى اللوحة
        </Button>
        {c.hasChanges && (
          <Button size="sm" variant="secondary" onPress={() => c.publish()}>حفظ ونشر</Button>
        )}
        <Button size="sm" variant="secondary" onPress={() => c.setPreview(false)}>إنهاء المعاينة</Button>
      </div>
    </div>
  );
}

function Shell() {
  const route = useRoute();
  const [cartOpen, setCartOpen] = useState(false);

  /* الانتقال إلى صفحة أخرى يغلق الدرج — وإلا بقي معلّقاً فوق الصفحة الجديدة. */
  useEffect(() => { setCartOpen(false); }, [route.name, route.code]);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-[100]
                                 focus:bg-ink focus:px-4 focus:py-3 focus:text-paper">
        تخطّي إلى المحتوى
      </a>
      <PreviewBar />
      <Header onCart={() => setCartOpen(true)} />
      <main id="main">
        {route.name === 'product' ? <Product code={route.code} onAdded={() => setCartOpen(true)} />
          : route.name === 'checkout' ? <Checkout />
          : route.name === 'admin' ? <Admin />
          : <Home onAdded={() => setCartOpen(true)} />}
      </main>
      <Footer />
      <CartDrawer isOpen={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}

export function App() {
  return (
    <ContentProvider>
      <CartProvider><Shell /></CartProvider>
    </ContentProvider>
  );
}
