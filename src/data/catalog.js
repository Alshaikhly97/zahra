/* vitaS — بيانات المتجر
   الألوان تُمرَّر إلى رسوم SVG عبر متغيّرات CSS، لذلك كل لون هنا قيمة hex حقيقية. */

export const COLORWAYS = {
  surgical: { name: 'أخضر جراحي',  hex: '#3F6B58', shade: '#2E5040', light: '#5A8B76' },
  ceil:     { name: 'أزرق سماوي',  hex: '#7A9CB8', shade: '#5C7B95', light: '#9BB8CE' },
  navy:     { name: 'كحلي',        hex: '#26334E', shade: '#182236', light: '#3D4E6E' },
  wine:     { name: 'نبيذي',       hex: '#6B2C39', shade: '#4E1D28', light: '#8C4653' },
  pewter:   { name: 'رمادي بيوتر', hex: '#6E7278', shade: '#53575C', light: '#8E9298' },
  ink:      { name: 'أسود فحمي',   hex: '#23262A', shade: '#141619', light: '#3C4046' },
  sand:     { name: 'رملي',        hex: '#B49B7C', shade: '#907A5F', light: '#CBB69B' },
  teal:     { name: 'أزرق كاريبي', hex: '#2F6E75', shade: '#1F5157', light: '#4A9098' }
};

export const SIZES   = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
export const INSEAMS = ['قصير ٢٧ بوصة', 'عادي ٣٠ بوصة', 'طويل ٣٣ بوصة'];

/* القَصّة: نفس القطعة بقالبين مختلفين — والصور تتبع الاختيار */
export const FITS = {
  women: { key: 'women', name: 'نسائي' },
  men:   { key: 'men',   name: 'رجالي' }
};

/* مكتبة صور الموديلات.
   `color` هو اللون الظاهر في الصورة فعلاً — يُعرض كتعليق حتى لا يُفهم
   أن الصورة تمثّل اللون المختار، لأن التصوير لا يغطّي كل الألوان. */
/* الصور المدمجة تُقدَّم من `public/img`. المسار يمرّ عبر BASE_URL لأن الموقع
   يُنشر تحت مسار فرعي على GitHub Pages — `/img/…` المطلق يقود إلى جذر النطاق
   فيسقط. BASE_URL ينتهي بشرطة مائلة دائماً، فلا تُضاف واحدة هنا. */
const IMG = import.meta.env.BASE_URL + 'img/';

export const PHOTOS = {
  'm-scrub-blue-front': { src: IMG + 'm-scrub-blue-front.jpg', color: 'أزرق سماوي',
    alt: 'ممرّض يرتدي طقم سكراب أزرق كامل بجيوب جانبية، لقطة أمامية بكامل الطول على خلفية بيضاء' },
  'm-scrub-blue-lean':  { src: IMG + 'm-scrub-blue-lean.jpg', color: 'أزرق سماوي',
    alt: 'ممرّض بطقم سكراب أزرق يقف مسنداً ظهره إلى باب زجاجي في ممرّ مستشفى' },
  'm-underscrub-a':     { src: IMG + 'm-underscrub-a.jpg', color: 'أزرق سماوي',
    alt: 'ممرّض يرتدي قميص سكراب أزرق فوق طبقة تحت-السكراب بيضاء بأكمام طويلة' },
  'm-underscrub-b':     { src: IMG + 'm-underscrub-b.jpg', color: 'أزرق سماوي',
    alt: 'ممرّض بطقم أزرق وطبقة داخلية بيضاء يفحص صورة أشعة' },
  'm-scrub-white':      { src: IMG + 'm-scrub-white.jpg', color: 'أبيض',
    alt: 'طبيب بطقم سكراب أبيض بكامل الطول يحمل حقيبة إسعافات' },
  'm-labcoat':          { src: IMG + 'm-labcoat.jpg', color: 'أبيض',
    alt: 'طبيب يرتدي معطف مختبر أبيض بجيوب سفلية، لقطة من الخصر إلى الأعلى' },

  'w-scrub-teal-a':     { src: IMG + 'w-scrub-teal-a.jpg', color: 'أزرق كاريبي',
    alt: 'ممرّضة بقميص سكراب أزرق كاريبي ويداها في الجيبين السفليين' },
  'w-scrub-teal-b':     { src: IMG + 'w-scrub-teal-b.jpg', color: 'أزرق كاريبي',
    alt: 'ممرّضة بقميص سكراب أزرق كاريبي تستعمل سمّاعة طبية' },
  'w-scrub-green':      { src: IMG + 'w-scrub-green.jpg', color: 'أخضر جراحي',
    alt: 'ممرّضة بقميص سكراب أخضر جراحي بجيب صدر، على خلفية فاتحة' },
  'w-scrub-blue':       { src: IMG + 'w-scrub-blue.jpg', color: 'أزرق سماوي',
    alt: 'ممرّضة بطقم سكراب أزرق كامل، تظهر الجيوب الأمامية وجيب الساق' },
  'w-scrub-pewter':     { src: IMG + 'w-scrub-pewter.jpg', color: 'رمادي بيوتر',
    alt: 'ممرّضة بطقم سكراب رمادي بيوتر على خلفية بيضاء' },
  'w-labcoat':          { src: IMG + 'w-labcoat.jpg', color: 'أبيض',
    alt: 'طبيبة ترتدي معطف مختبر أبيض ويداها في الجيبين' }
};

/* type: يحدّد أي رسم SVG يُستعمل — top | pant | coat | jacket | underscrub */
export const PRODUCTS = [
  {
    code: 'VS-01', type: 'top', name: 'سكراب كلاسيك — قميص',
    models: { men: ['m-scrub-blue-front', 'm-scrub-blue-lean'], women: ['w-scrub-teal-a', 'w-scrub-teal-b'] },
    tagline: 'الياقة V المزدوجة، ست جيوب، قصّة لا تنكمش بعد الغسلة العاشرة.',
    price: 66000, fabric: '72% بوليستر · 21% ريون · 7% إيلاستين', gsm: 175,
    pockets: 6, stretch: '٤ اتجاهات',
    colors: ['surgical', 'ceil', 'navy', 'wine', 'pewter', 'ink'],
    specs: [
      ['الياقة', 'V مزدوجة بحاشية مثبّتة'],
      ['الجيوب', 'صدر واحد + جانبيان + جيب هاتف داخلي + حلقة بطاقة + جيب مقص'],
      ['الحاشية', 'شقّ جانبي ٨ سم لحرية الحركة'],
      ['العناية', 'غسيل ٦٠° · لا يحتاج كي']
    ]
  },
  {
    code: 'VS-02', type: 'pant', name: 'بنطال جوجر مرن',
    models: { men: ['m-scrub-blue-front', 'm-underscrub-a'],    women: ['w-scrub-blue', 'w-scrub-pewter'] },
    tagline: 'خصر مزدوج الشدّ ورباط داخلي — يبقى مكانه خلال المناوبة كاملة.',
    price: 62000, fabric: '72% بوليستر · 21% ريون · 7% إيلاستين', gsm: 175,
    pockets: 7, stretch: '٤ اتجاهات',
    colors: ['surgical', 'ceil', 'navy', 'pewter', 'ink', 'teal'],
    inseam: true,
    specs: [
      ['الخصر', 'حزام مطاطي عريض + رباط داخلي'],
      ['الجيوب', 'جيبان أماميان + خلفي بسحّاب + جيب ساق مقسّم + جيب هاتف'],
      ['الأساور', 'أساور مرنة عند الكاحل'],
      ['العناية', 'غسيل ٦٠° · لا يحتاج كي']
    ]
  },
  {
    code: 'VS-03', type: 'coat', name: 'معطف مختبر ¾',
    models: { men: ['m-labcoat'],                                women: ['w-labcoat'] },
    tagline: 'طبقة خارجية طاردة للسوائل بطول يغطّي الجلوس الطويل.',
    price: 90000, fabric: '65% بوليستر · 35% قطن · معالجة طاردة', gsm: 210,
    pockets: 5, stretch: 'اتجاهان',
    colors: ['pewter', 'navy', 'ink'],
    specs: [
      ['الطول', '٩٠ سم — يغطّي عند الجلوس'],
      ['المعالجة', 'طاردة للسوائل ومقاومة للبقع'],
      ['الجيوب', 'صدر + جيبان سفليان + جيبان داخليان'],
      ['التفاصيل', 'فتحة خلفية وأزرار مخفية']
    ]
  },
  {
    code: 'VS-04', type: 'jacket', name: 'جاكيت تدفئة للمناوبة',
    models: { men: ['m-scrub-white', 'm-scrub-blue-lean'],      women: ['w-scrub-pewter', 'w-scrub-blue'] },
    tagline: 'للأقسام الباردة — يُلبس فوق السكراب دون أن يقيّد الكتف.',
    price: 80000, fabric: '88% بوليستر · 12% إيلاستين · بطانة خفيفة', gsm: 240,
    pockets: 4, stretch: '٤ اتجاهات',
    colors: ['navy', 'surgical', 'wine', 'ink', 'pewter'],
    specs: [
      ['الإغلاق', 'سحّاب كامل بسحّابة صامتة'],
      ['الأكمام', 'كتف رَغلان لمدى حركة كامل'],
      ['الجيوب', 'جيبان بسحّاب + جيبان داخليان'],
      ['التفاصيل', 'أساور مرنة تمنع دخول الهواء']
    ]
  },
  {
    code: 'VS-05', type: 'underscrub', name: 'تحت-السكراب بأكمام طويلة',
    models: { men: ['m-underscrub-a', 'm-underscrub-b'],        women: ['w-scrub-green', 'w-scrub-teal-a'] },
    tagline: 'طبقة أولى تسحب العرق، رقيقة بما يكفي لتختفي تحت القميص.',
    price: 41000, fabric: '92% بوليستر مايكرو · 8% إيلاستين', gsm: 130,
    pockets: 0, stretch: '٤ اتجاهات',
    colors: ['ink', 'pewter', 'navy', 'sand', 'surgical'],
    specs: [
      ['الوظيفة', 'سحب الرطوبة وتجفيف سريع'],
      ['القصّة', 'ملاصقة دون ضغط'],
      ['الأكمام', 'حلقة إبهام تثبّت الكم'],
      ['العناية', 'غسيل ٤٠° · تجفيف بالهواء']
    ]
  },
  {
    code: 'VS-06', type: 'top', name: 'قميص جراحي بياقة V',
    models: { men: ['m-scrub-blue-front', 'm-scrub-white'],     women: ['w-scrub-green', 'w-scrub-teal-b'] },
    tagline: 'قصّة أوسع عند الكتف لغرفة العمليات، بلا جيوب خارجية.',
    price: 59000, fabric: '65% بوليستر · 35% قطن', gsm: 165,
    pockets: 1, stretch: 'اتجاهان',
    colors: ['surgical', 'teal', 'ceil'],
    specs: [
      ['الياقة', 'V واسعة تُلبس فوق الرأس بسهولة'],
      ['الجيوب', 'جيب صدر واحد فقط — مطابق لبروتوكول العمليات'],
      ['القصّة', 'أوسع عند الكتف والصدر'],
      ['العناية', 'يتحمّل التعقيم الصناعي المتكرّر']
    ]
  }
];

/* الإصدارات الخاصة — كميات محدودة، لكل إصدار سبب وجود */
export const EDITIONS = [
  {
    code: 'ED-01', type: 'top', name: 'إصدار الأطفال',
    models: { men: ['m-underscrub-a'],     women: ['w-scrub-teal-a'] },
    unit: 'قسم طب الأطفال',
    story: 'طُبع النمط على الحاشية الداخلية فقط: يظهر حين ترفع ذراعك للطفل، ويختفي في التقرير الطبي.',
    price: 76000, run: '٤٠٠ قطعة', color: 'teal', accentColor: '#E5883C', pattern: true
  },
  {
    code: 'ED-02', type: 'top', name: 'إصدار الجراحة',
    models: { men: ['m-scrub-blue-front'], women: ['w-scrub-green'] },
    unit: 'غرفة العمليات',
    story: 'الأخضر الجراحي الأصلي — اللون الذي اختير قبل قرن لأنه يريح العين بعد التحديق في الأحمر.',
    price: 83000, run: '٢٥٠ قطعة', color: 'surgical', accentColor: '#DE7259'
  },
  {
    code: 'ED-03', type: 'coat', name: 'إصدار التخرّج',
    models: { men: ['m-labcoat'],          women: ['w-labcoat'] },
    unit: 'دفعة ٢٠٢٦',
    story: 'معطف مختبر بتطريز الاسم والتخصص على الصدر. يُنفَّذ حسب الطلب، ولا يُعاد طرحه.',
    price: 122000, run: 'حسب الطلب', color: 'pewter', accentColor: '#5AA3BE', embroidery: true
  },
  {
    code: 'ED-04', type: 'jacket', name: 'إصدار المناوبة الليلية',
    models: { men: ['m-scrub-white'],      women: ['w-scrub-pewter'] },
    unit: 'الطوارئ والإسعاف',
    story: 'حواف عاكسة على الكتف والكم — تُرى في موقف السيارات الساعة الثالثة فجراً.',
    price: 101000, run: '٣٠٠ قطعة', color: 'ink', accentColor: '#C9D93F', reflective: true
  }
];

/* نقاط الإحالة على المخطّط الفني — العنصر المميّز في الصفحة */
export const CALLOUTS = [
  { n: 1, x: 50,   y: 26, title: 'ياقة V مزدوجة',       body: 'حاشية مثبّتة بغرزتين لا تتموّج بعد الغسيل المتكرّر.' },
  { n: 2, x: 65,   y: 44, title: 'جيب الصدر',            body: 'يتّسع لقلمين وبطاقة تعريف، بعمق ١٤ سم يمنع السقوط عند الانحناء.' },
  { n: 3, x: 35.5, y: 39, title: 'حلقة البطاقة',         body: 'عروة مقوّاة لبكرة البطاقة — لا تشدّ القماش ولا تترك أثراً.' },
  { n: 4, x: 63,   y: 67, title: 'جيب المقص المقسّم',   body: 'خانتان منفصلتان للمقص والقلم الضوئي حتى لا يصطدما.' },
  { n: 5, x: 37,   y: 67, title: 'جيب الهاتف الداخلي',   body: 'مبطّن ومغلق من الأعلى، يبقي الجهاز ثابتاً أثناء الجري.' },
  { n: 6, x: 28.5, y: 85, title: 'الشقّ الجانبي',        body: 'فتحة ٨ سم عند الحاشية تمنح مدى حركة كاملاً عند الانحناء.' },
  { n: 7, x: 30,   y: 19, title: 'خياطة الكتف المائلة',  body: 'تُبعد الدرزة عن أعلى الكتف حيث يضغط حزام الحقيبة.' }
];
