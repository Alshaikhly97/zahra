/* تصغير الصورة قبل التخزين.

   الصور تُحفظ كـ data URL داخل localStorage، وحصّته ~٥ ميغابايت لكل الموقع —
   وتُحسب مرّتين لأن المسودّة والمنشور نسختان. لذلك التصغير إلزامي لا تحسين. */

export const MAX_EDGE = 1100;
export const QUALITY = 0.72;
/* حدّ لكل صورة بعد الترميز: نقيس الناتج لا الأصل. */
export const MAX_BYTES = 420 * 1024;

export function downscaleImage(file, maxEdge = MAX_EDGE, quality = QUALITY) {
  return new Promise((resolve, reject) => {
    if (!/^image\//.test(file.type)) return reject(new Error('الملف ليس صورة.'));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#FFFFFF';           /* JPEG بلا شفافية */
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      let q = quality, dataUrl = cv.toDataURL('image/jpeg', q);
      /* خفض الجودة تدريجياً حتى الحدّ بدل الرفض المباشر */
      while (dataUrl.length > MAX_BYTES && q > 0.4) {
        q -= 0.08;
        dataUrl = cv.toDataURL('image/jpeg', q);
      }
      resolve({ dataUrl, width: w, height: h, bytes: dataUrl.length, quality: q });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('تعذّر فتح الصورة.')); };
    img.src = url;
  });
}

export const fmtBytes = n =>
  n >= 1024 * 1024 ? (n / 1024 / 1024).toFixed(1) + ' م.ب' : Math.round(n / 1024) + ' ك.ب';
