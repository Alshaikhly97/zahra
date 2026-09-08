/* vitaS — رسوم القطع.
   نُقلت كما هي من الموقع الثابت: نفس مسارات SVG ونفس أسلوب الرسم الفني.
   الرسم يُبنى كنص ثم يُحقن، فهو ثابت لا تفاعل فيه. */

const INK = '#17241F';

function svg(vb, inner) {
  return `<svg viewBox="${vb}" role="img" fill="none"
    stroke-linejoin="round" stroke-linecap="round"
    xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

/* درزة متقطّعة */
const stitch = (d, c, w = 1.1) =>
  `<path d="${d}" stroke="${c}" stroke-width="${w}" stroke-dasharray="4 3.5" opacity=".62"/>`;

function drawTop(c, o = {}) {
  const big = o.big;
  const body = 'M145,55 L95,72 L40,150 L78,190 L110,152 L110,412 L290,412 L290,152 L322,190 L360,150 L305,72 L255,55 L200,140 Z';
  return svg('0 0 400 460', `
    <path d="${body}" fill="${c.hex}" stroke="${INK}" stroke-width="2.4"/>
    <!-- لوح ظل على الجانب لإعطاء حجم -->
    <path d="M250,150 L290,152 L290,412 L250,412 Z" fill="${c.shade}" opacity=".38"/>
    <!-- حاشية الياقة المزدوجة -->
    <path d="M145,55 L200,140 L255,55" stroke="${c.light}" stroke-width="9" opacity=".9"/>
    ${stitch('M152,64 L200,138 L248,64', c.shade, 1.3)}
    <!-- درزات الكتف والجنب -->
    ${stitch('M110,158 L110,405', c.shade)}
    ${stitch('M290,158 L290,405', c.shade)}
    ${stitch('M116,405 L284,405', c.shade)}
    <!-- جيب الصدر -->
    <path d="M232,172 h54 v60 h-54 Z" fill="${c.shade}" opacity=".5" stroke="${INK}" stroke-width="1.8"/>
    ${stitch('M232,184 h54', c.light, 1.3)}
    <!-- حلقة البطاقة -->
    <path d="M132,170 h16 v22 h-16 Z" fill="${c.light}" stroke="${INK}" stroke-width="1.6"/>
    <!-- الجيوب السفلية -->
    <path d="M216,268 h70 v82 h-70 Z" fill="${c.shade}" opacity=".5" stroke="${INK}" stroke-width="1.8"/>
    <path d="M114,268 h70 v82 h-70 Z" fill="${c.shade}" opacity=".5" stroke="${INK}" stroke-width="1.8"/>
    <!-- الفاصل الداخلي لجيب المقص -->
    ${big ? `<path d="M251,268 v82" stroke="${INK}" stroke-width="1.6" opacity=".55"/>` : ''}
    <!-- الشقّ الجانبي -->
    <path d="M110,372 v40" stroke="${INK}" stroke-width="2.6"/>
    <path d="M290,372 v40" stroke="${INK}" stroke-width="2.6"/>
    <!-- حواف الأكمام -->
    ${stitch('M50,152 L84,182', c.shade)}
    ${stitch('M350,152 L316,182', c.shade)}
    ${o.pattern ? `<path d="M116,392 h168" stroke="${o.accent}" stroke-width="7" stroke-dasharray="9 7"/>` : ''}
    ${o.embroidery ? `<path d="M236,196 h46" stroke="${o.accent}" stroke-width="3.4"/>
                      <path d="M236,208 h30" stroke="${o.accent}" stroke-width="3.4"/>` : ''}
  `);
}

function drawPant(c) {
  return svg('0 0 400 460', `
    <path d="M96,30 L304,30 L312,74 L296,430 L232,430 L200,214 L168,430 L104,430 L88,74 Z"
          fill="${c.hex}" stroke="${INK}" stroke-width="2.4"/>
    <path d="M200,214 L232,430 L296,430 L312,74 L200,74 Z" fill="${c.shade}" opacity=".3"/>
    <!-- حزام الخصر -->
    <path d="M92,30 L308,30 L311,70 L89,70 Z" fill="${c.shade}" stroke="${INK}" stroke-width="2.2"/>
    ${stitch('M94,44 L306,44', c.light, 1.3)}
    <!-- الرباط الداخلي -->
    <path d="M176,52 q24,16 48,0" stroke="${INK}" stroke-width="2.4"/>
    <path d="M176,52 v22" stroke="${INK}" stroke-width="2.4"/>
    <path d="M224,52 v22" stroke="${INK}" stroke-width="2.4"/>
    <!-- الجيوب الأمامية المائلة -->
    <path d="M112,78 L146,124" stroke="${INK}" stroke-width="2.2"/>
    <path d="M288,78 L254,124" stroke="${INK}" stroke-width="2.2"/>
    <!-- جيب الساق المقسّم -->
    <path d="M258,196 h44 v72 h-44 Z" fill="${c.shade}" opacity=".55" stroke="${INK}" stroke-width="1.8"/>
    <path d="M280,196 v72" stroke="${INK}" stroke-width="1.5" opacity=".6"/>
    ${stitch('M258,208 h44', c.light, 1.3)}
    <!-- درزة المنتصف -->
    ${stitch('M200,74 L200,210', c.shade)}
    <!-- أساور الكاحل -->
    <path d="M104,398 h64 v32 h-64 Z" fill="${c.shade}" stroke="${INK}" stroke-width="2.2"/>
    <path d="M232,398 h64 v32 h-64 Z" fill="${c.shade}" stroke="${INK}" stroke-width="2.2"/>
    ${stitch('M110,414 h52', c.light, 1.2)}
    ${stitch('M238,414 h52', c.light, 1.2)}
  `);
}

function drawCoat(c, o = {}) {
  return svg('0 0 400 460', `
    <path d="M148,48 L96,68 L42,152 L80,190 L112,154 L112,428 L288,428 L288,154 L320,190 L358,152 L304,68 L252,48 Z"
          fill="${c.hex}" stroke="${INK}" stroke-width="2.4"/>
    <path d="M248,154 L288,154 L288,428 L248,428 Z" fill="${c.shade}" opacity=".34"/>
    <!-- الياقة والطية -->
    <path d="M148,48 L200,112 L252,48 L232,44 L200,86 L168,44 Z" fill="${c.shade}" stroke="${INK}" stroke-width="2"/>
    <!-- فتحة الأزرار -->
    <path d="M200,112 L200,428" stroke="${INK}" stroke-width="2"/>
    ${stitch('M188,116 L188,424', c.shade)}
    <circle cx="200" cy="164" r="6" fill="${c.light}" stroke="${INK}" stroke-width="1.6"/>
    <circle cx="200" cy="222" r="6" fill="${c.light}" stroke="${INK}" stroke-width="1.6"/>
    <circle cx="200" cy="280" r="6" fill="${c.light}" stroke="${INK}" stroke-width="1.6"/>
    <!-- جيب الصدر -->
    <path d="M232,150 h48 v42 h-48 Z" fill="${c.shade}" opacity=".5" stroke="${INK}" stroke-width="1.7"/>
    <!-- الجيوب السفلية -->
    <path d="M124,296 h64 v76 h-64 Z" fill="${c.shade}" opacity=".5" stroke="${INK}" stroke-width="1.8"/>
    <path d="M212,296 h64 v76 h-64 Z" fill="${c.shade}" opacity=".5" stroke="${INK}" stroke-width="1.8"/>
    ${stitch('M118,420 h164', c.shade)}
    ${o.embroidery ? `<path d="M234,206 h44" stroke="${o.accent}" stroke-width="3.6"/>
                      <path d="M234,219 h28" stroke="${o.accent}" stroke-width="3.6"/>` : ''}
  `);
}

function drawJacket(c, o = {}) {
  return svg('0 0 400 460', `
    <path d="M150,50 L98,70 L40,168 L74,236 L114,180 L114,398 L286,398 L286,180 L326,236 L360,168 L302,70 L250,50 Z"
          fill="${c.hex}" stroke="${INK}" stroke-width="2.4"/>
    <path d="M246,180 L286,180 L286,398 L246,398 Z" fill="${c.shade}" opacity=".34"/>
    <!-- ياقة قائمة -->
    <path d="M150,50 L200,74 L250,50 L250,30 L150,30 Z" fill="${c.shade}" stroke="${INK}" stroke-width="2.2"/>
    <!-- السحّاب -->
    <path d="M200,74 L200,398" stroke="${INK}" stroke-width="3"/>
    <path d="M200,74 L200,398" stroke="${c.light}" stroke-width="1.4" stroke-dasharray="3 3"/>
    <rect x="194" y="150" width="12" height="20" rx="2" fill="${c.light}" stroke="${INK}" stroke-width="1.6"/>
    <!-- درزة رَغلان -->
    ${stitch('M114,182 L152,64', c.shade, 1.3)}
    ${stitch('M286,182 L248,64', c.shade, 1.3)}
    <!-- جيوب بسحّاب -->
    <path d="M128,268 L184,268" stroke="${INK}" stroke-width="2.6"/>
    <path d="M216,268 L272,268" stroke="${INK}" stroke-width="2.6"/>
    <!-- أساور وحاشية -->
    <path d="M114,370 h172 v28 h-172 Z" fill="${c.shade}" stroke="${INK}" stroke-width="2.2"/>
    <path d="M56,212 L92,212 L82,244 L46,240 Z" fill="${c.shade}" stroke="${INK}" stroke-width="2"/>
    <path d="M344,212 L308,212 L318,244 L354,240 Z" fill="${c.shade}" stroke="${INK}" stroke-width="2"/>
    ${o.reflective ? `<path d="M104,150 L58,214" stroke="${o.accent}" stroke-width="7"/>
                      <path d="M296,150 L342,214" stroke="${o.accent}" stroke-width="7"/>
                      <path d="M114,384 h172" stroke="${o.accent}" stroke-width="5"/>` : ''}
  `);
}

function drawUnderscrub(c) {
  return svg('0 0 400 460', `
    <path d="M154,52 L104,70 L48,150 L26,352 L74,364 L114,196 L118,420 L282,420 L286,196 L326,364 L374,352 L352,150 L296,70 L246,52 L200,96 Z"
          fill="${c.hex}" stroke="${INK}" stroke-width="2.4"/>
    <path d="M244,196 L286,196 L282,420 L244,420 Z" fill="${c.shade}" opacity=".3"/>
    <!-- ياقة دائرية -->
    <path d="M154,52 Q200,102 246,52" stroke="${c.light}" stroke-width="8"/>
    ${stitch('M160,60 Q200,104 240,60', c.shade, 1.2)}
    <!-- درزات جانبية -->
    ${stitch('M118,210 L118,412', c.shade)}
    ${stitch('M282,210 L282,412', c.shade)}
    ${stitch('M124,412 h152', c.shade)}
    <!-- حلقة الإبهام -->
    <path d="M40,330 q-16,12 -4,26 q14,10 26,-4" stroke="${INK}" stroke-width="2.4"/>
    <path d="M360,330 q16,12 4,26 q-14,10 -26,-4" stroke="${INK}" stroke-width="2.4"/>
    <path d="M30,344 L74,356" stroke="${c.shade}" stroke-width="6" opacity=".8"/>
    <path d="M370,344 L326,356" stroke="${c.shade}" stroke-width="6" opacity=".8"/>
  `);
}

export function garmentHTML(type, c, o = {}) {
  const map = { top: drawTop, pant: drawPant, coat: drawCoat, jacket: drawJacket, underscrub: drawUnderscrub };
  return (map[type] || drawTop)(c, o);
}

/* رسم SVG بلا width/height صريحين لا حجم ذاتي له، فيتقلّص إلى صفر مع w-auto.
   fit="width"  → يملأ العرض والارتفاع يتبع النسبة (بطاقات الشبكة).
   fit="box"    → يملأ الصندوق كاملاً، و preserveAspectRatio الافتراضي
                  يعطي سلوك «contain» بلا قصّ (المصغّرات ولوح المعرض). */
export function Garment({ type, color, opts = {}, fit = 'width', className = '' }) {
  const svgFit = fit === 'box'
    ? '[&>svg]:block [&>svg]:h-full [&>svg]:w-full'
    : '[&>svg]:block [&>svg]:h-auto [&>svg]:w-full';
  const box = fit === 'box' ? 'block h-full w-full' : 'block w-full';
  return (
    <span
      className={`${box} ${svgFit} ${className}`}
      dangerouslySetInnerHTML={{ __html: garmentHTML(type, color, opts) }}
    />
  );
}
