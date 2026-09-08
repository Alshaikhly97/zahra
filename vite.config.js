import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  /* الموقع يُنشر كـ GitHub Pages تحت مسار المستودع لا جذر النطاق:
     https://alshaikhly97.github.io/zahra/ — والشرطتان مقصودتان،
     Vite يبني عليهما كل مسارات الأصول و `import.meta.env.BASE_URL`. */
  base: '/zahra/',
  plugins: [react(), tailwindcss()],
  server: {
    /* بلا منفذ ثابت: المشروع لا يحتاج منفذاً بعينه (لا OAuth ولا webhooks)،
       فيأخذ ما يسنده المشغّل عبر PORT. */
    port: process.env.PORT ? Number(process.env.PORT) : undefined
  }
});
