/* التنسيق العربي. money() مشتركة مع الوزن والجيوب والكمّية،
   ولذلك السعر له دالّة مستقلّة — إضافة صيغة عملة إلى money() تفسدها كلها. */

export const money = n => new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(n);
export const price = n => money(n) + ' د.ع';
export const pad2 = n => money(n).padStart(2, '٠');

/* العربية تُعدّ المعدود بثلاث صيغ — «١ جيوب» خطأ نحوي واضح في واجهة عربية. */
export function pockets(n) {
  if (n === 0) return 'بلا جيوب';
  if (n === 1) return 'جيب واحد';
  if (n === 2) return 'جيبان';
  if (n <= 10) return money(n) + ' جيوب';
  return money(n) + ' جيباً';
}
