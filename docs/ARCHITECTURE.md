# معماری «nodeditor» — یک ویرایشگر نود برای طراحی وکتور دوبعدی روی React

> این سند یک طراحی معماری عمیق برای ساخت یک نرم‌افزار طراحی **وکتور دوبعدی مبتنی بر گراف نود** است که از سیستم‌های نود بالغ مثل **Blender (Geometry/Shader Nodes)**، **Houdini (SOP/VOP)** و **Substance Designer** الهام گرفته و آن‌ها را برای دامنه‌ی گرافیک وکتور دوبعدی روی وب (React + TypeScript) بازآفرینی می‌کند.

---

## فهرست مطالب

1. [هدف و چشم‌انداز](#۱-هدف-و-چشمانداز)
2. [تحلیل سیستم‌های نود مرجع](#۲-تحلیل-سیستمهای-نود-مرجع)
3. [الگوهای مشترک و درس‌های استخراج‌شده](#۳-الگوهای-مشترک-و-درسهای-استخراجشده)
4. [تطبیق این مفاهیم با دامنه‌ی وکتور دوبعدی](#۴-تطبیق-این-مفاهیم-با-دامنهی-وکتور-دوبعدی)
5. [معماری کلان (نمای لایه‌ای)](#۵-معماری-کلان-نمای-لایهای)
6. [هسته‌ی گراف: مدل داده و سیستم نوع](#۶-هستهی-گراف-مدل-داده-و-سیستم-نوع)
7. [موتور ارزیابی (Evaluation Engine)](#۷-موتور-ارزیابی-evaluation-engine)
8. [مدل داده‌ی وکتوری که در گراف جریان دارد](#۸-مدل-دادهی-وکتوری-که-در-گراف-جریان-دارد)
9. [کتابخانه‌ی نودها (Node Library)](#۹-کتابخانهی-نودها-node-library)
10. [زیرگراف‌ها، گروه‌ها و کپسوله‌سازی](#۱۰-زیرگرافها-گروهها-و-کپسولهسازی)
11. [لایه‌ی رابط کاربری با React](#۱۱-لایهی-رابط-کاربری-با-react)
12. [مدیریت وضعیت، فرمان‌ها و Undo/Redo](#۱۲-مدیریت-وضعیت-فرمانها-و-undoredo)
13. [Viewport و رندر خروجی وکتور](#۱۳-viewport-و-رندر-خروجی-وکتور)
14. [انیمیشن و وابستگی به زمان](#۱۴-انیمیشن-و-وابستگی-به-زمان)
15. [سریال‌سازی و فرمت فایل](#۱۵-سریالسازی-و-فرمت-فایل)
16. [توسعه‌پذیری و سیستم افزونه](#۱۶-توسعهپذیری-و-سیستم-افزونه)
17. [پشته‌ی فناوری پیشنهادی](#۱۷-پشتهی-فناوری-پیشنهادی)
18. [ساختار پوشه‌ها](#۱۸-ساختار-پوشهها)
19. [ملاحظات کارایی](#۱۹-ملاحظات-کارایی)
20. [نقشه‌ی راه پیاده‌سازی (فازبندی)](#۲۰-نقشهی-راه-پیادهسازی-فازبندی)

---

## ۱. هدف و چشم‌انداز

هدف، ساخت یک ابزار طراحی وکتور **پروسیجرال (Procedural)** و **غیرمخرب (Non-destructive)** است؛ جایی که کاربر به‌جای رسم مستقیم اشکال، یک **گراف از عملیات** می‌سازد که خروجی نهایی‌اش یک صحنه‌ی وکتوری است. این یعنی:

- هر تغییری در بالادست گراف، به‌صورت زنده در خروجی منعکس می‌شود.
- طراحی قابل پارامتری‌سازی، قابل تکرار و قابل انیمیت است.
- منطق «چگونگی ساخت یک شکل» از «خود شکل» جدا می‌شود.

نزدیک‌ترین مراجع تجاری به این ایده: **Cavalry**، **Notch**، **TouchDesigner** (برای بخش ۲بعدی) و **Substance Designer** (برای مدل گراف بافت). این پروژه ترکیبی از فلسفه‌ی این ابزارها را در یک بوم وب پیاده می‌کند.

---

## ۲. تحلیل سیستم‌های نود مرجع

### ۲.۱ Blender — Geometry Nodes / Shader Nodes / Compositor

| ویژگی | توضیح |
|---|---|
| **سوکت‌های نوع‌دار و رنگی** | هر نوع داده (Geometry، Float، Vector، Color، Shader، Boolean، String) رنگ مخصوص دارد؛ اتصال‌های ناسازگار خودکار رد یا تبدیل (cast) می‌شوند. |
| **سیستم Field/Attribute** | در Geometry Nodes داده‌ها می‌توانند «میدان» باشند: یک مقدار که به ازای هر نقطه/وجه به‌صورت تنبل (lazy) ارزیابی می‌شود (مثلاً موقعیت هر نقطه). این جداسازی «مقدار ثابت» از «مقدار وابسته به دامنه» بسیار قدرتمند است. |
| **Node Group** | چند نود را در یک نود واحد با ورودی/خروجی تعریف‌شده کپسوله می‌کند؛ قابل استفاده‌ی مجدد. |
| **Reroute / Frame** | نقاط بازپخش سیم برای مرتب‌سازی و فریم‌های رنگی برای گروه‌بندی بصری. |
| **Mute / Viewer node** | خاموش کردن موقت نود؛ نود Viewer برای بازرسی خروجی میانی. |
| **ارزیابی بلادرنگ** | گراف به‌صورت تنبل و وابسته به وابستگی‌ها ارزیابی می‌شود. |
| **منوی Add با جست‌وجو** | افزودن نود با تایپ نام. |

### ۲.۲ Houdini — استاندارد طلایی پروسیجرال

| ویژگی | توضیح |
|---|---|
| **شبکه‌های تو‌در‌تو (Subnetworks)** | امکان «شیرجه» (dive in/out) داخل نودها؛ هر نود می‌تواند خودش یک گراف کامل باشد. |
| **مدل Cook + Dirty Propagation** | فقط نودهایی که «کثیف» شده‌اند دوباره پخت (cook) می‌شوند؛ نتایج cache می‌شوند. |
| **پرچم‌های نود (Flags)** | Display flag، Render flag، Bypass، Lock، Template — کنترل اینکه کدام نود نمایش/خروجی است. |
| **ارجاع پارامترها (Channel references / Expressions)** | پارامتر یک نود می‌تواند به پارامتر نود دیگر یا یک عبارت ارجاع دهد. |
| **سیستم Attribute روی هندسه** | داده روی Point/Vertex/Primitive/Detail نگهداری می‌شود. |
| **حلقه‌ها و بازخورد** | For-Each / Compile blocks برای تکرار و حلقه‌های feedback. |
| **Spreadsheet / Geometry inspector** | بازرسی داده‌ی خام در هر نقطه از گراف. |
| **ابزار سازماندهی** | Network box، Sticky note، Dot (reroute)، رنگ و شکل نود. |

### ۲.۳ Substance Designer — نزدیک‌ترین به دامنه‌ی ما

| ویژگی | توضیح |
|---|---|
| **گراف تولید بافت** | هر نود یک بیت‌مپ خروجی می‌دهد؛ گراف از ورودی‌ها به خروجی‌های نهایی جریان دارد. |
| **پیش‌نمایش درون‌خطی (thumbnail)** | هر نود تصویر کوچک خروجی‌اش را نشان می‌دهد — بازخورد بصری فوری. |
| **پارامترهای Exposed** | پارامترهای یک گراف می‌توانند «بیرون‌داده» شوند تا یک دارایی قابل‌استفاده‌ی مجدد و پارامتریک بسازند. |
| **زیرگراف تابعی (Function graph / Pixel processor)** | گراف‌های کوچک برای محاسبه‌ی هر پارامتر یا هر پیکسل. |
| **وراثت رزولوشن/فرمت** | تنظیمات از بالادست به پایین‌دست به ارث می‌رسد مگر override شود. |

---

## ۳. الگوهای مشترک و درس‌های استخراج‌شده

از مقایسه‌ی بالا، این **اصول مشترک** بیرون می‌آید که ستون فقرات معماری ما خواهند بود:

1. **گراف جهت‌دار بدون دور (DAG) با جریان داده** از ورودی به خروجی.
2. **سوکت‌های نوع‌دار** با بررسی سازگاری، رنگ‌بندی و تبدیل خودکار (cast).
3. **ارزیابی تنبل + انتشار کثیفی + کش** (lazy pull + dirty push + memoization) — هرگز چیزی که لازم نیست بازمحاسبه نشود.
4. **کپسوله‌سازی (Node Group / Subnetwork)** برای انتزاع و استفاده‌ی مجدد.
5. **پارامترها با ویجت‌های متنوع** + امکان ارجاع/عبارت بین پارامترها.
6. **پیش‌نمایش درون‌خطی** و **نود Viewer/Output** برای بازخورد بصری.
7. **ابزار سازماندهی**: فریم، یادداشت، reroute، رنگ نود، جست‌وجوی افزودن.
8. **پرچم‌های نود**: Bypass/Mute، Output/Display، Lock.
9. **Undo/Redo قوی** و **سریال‌سازی پایدار**.
10. **هسته‌ی مستقل از UI** (engine جدا از React) تا قابل تست و قابل اجرا در worker باشد.

---

## ۴. تطبیق این مفاهیم با دامنه‌ی وکتور دوبعدی

دامنه‌ی ما به‌جای «هندسه‌ی سه‌بعدی» یا «بیت‌مپ»، **هندسه‌ی وکتوری دوبعدی** است. معادل‌سازی مفاهیم:

| مفهوم در مراجع | معادل در nodeditor |
|---|---|
| Geometry (Blender) / Geo (Houdini) | **Scene** = مجموعه‌ای از Pathها (منحنی‌های بِزیه) با Transform و Style |
| Point/Vertex attributes | صفات روی نقاط مسیر (Anchor points): موقعیت، دسته‌های کنترلی، شعاع، وزن |
| Bitmap (Substance) | خروجی نهایی به‌صورت **SVG/Canvas** قابل رندر |
| Field (Blender) | **میدان دوبعدی**: تابعی که به ازای هر نقطه یا هر کلون یک مقدار می‌دهد (نویز، گرادیان، فاصله) |
| Material/Shader | **Style**: Fill، Stroke، Gradient، Opacity، Blend mode |

**انواع داده‌ای که روی سیم‌ها جریان دارند:**

- `Scene` (لیست شکل‌ها) — نوع اصلی هندسی
- `Path` / `Shape` — یک مسیر وکتوری منفرد
- `Number`, `Vector2`, `Color`, `Boolean`, `String`, `Angle`
- `Gradient`, `Style`
- `Field<T>` — مقدار وابسته به دامنه (برای driving پارامترها)
- `Transform` (ماتریس affine)

---

## ۵. معماری کلان (نمای لایه‌ای)

طراحی بر اساس **جداسازی سخت‌گیرانه‌ی هسته از UI** است. هسته هیچ وابستگی‌ای به React ندارد و می‌تواند در یک Web Worker اجرا شود.

```
┌──────────────────────────────────────────────────────────────┐
│                         React UI Layer                         │
│  NodeCanvas │ Inspector │ Viewport │ Outliner │ Palette/Search  │
│            (React + React Flow + Zustand selectors)            │
└───────────────▲───────────────────────────────┬───────────────┘
                │ commands / events              │ state subscribe
┌───────────────┴───────────────────────────────▼───────────────┐
│                    Application / Store Layer                   │
│  Zustand store · Command bus · Undo/Redo (patches) · Selection │
└───────────────▲───────────────────────────────┬───────────────┘
                │ mutate graph                   │ eval results
┌───────────────┴───────────────────────────────▼───────────────┐
│                      Core Engine (pure TS)                     │
│  Graph model · Type system · Node registry · Eval scheduler ·  │
│  Dirty tracking · Result cache · Serialization                 │
└───────────────▲───────────────────────────────┬───────────────┘
                │                                │
┌───────────────┴────────────┐   ┌──────────────▼───────────────┐
│   Geometry / Math Library   │   │      Node Definitions        │
│  paths · bezier · boolean   │   │  generators · modifiers ...  │
│  ops · transforms · fields  │   │  (data, not UI)              │
└─────────────────────────────┘   └──────────────────────────────┘
```

چهار لایه:

1. **Core Engine** — مدل گراف، سیستم نوع، رجیستری نود، زمان‌بند ارزیابی، کش. کاملاً مستقل و قابل تست با Vitest، بدون DOM.
2. **Geometry/Math Library** — توابع خالص برای کار با مسیرهای بِزیه، عملیات بولین، تبدیل‌ها و میدان‌ها.
3. **Application/Store** — پل بین هسته و UI؛ مدیریت وضعیت، فرمان‌ها و تاریخچه.
4. **React UI** — اجزای بصری که فقط از store می‌خوانند و فرمان صادر می‌کنند.

---

## ۶. هسته‌ی گراف: مدل داده و سیستم نوع

### ۶.۱ ساختارهای داده‌ی پایه

```ts
type NodeId = string;
type SocketId = string;   // `${nodeId}:${portKey}`
type EdgeId = string;

interface GraphModel {
  nodes: Record<NodeId, NodeInstance>;
  edges: Record<EdgeId, Edge>;
  // ترتیب توپولوژیک کش‌شده برای ارزیابی
  meta: { name: string; version: number };
}

interface NodeInstance {
  id: NodeId;
  type: string;                 // کلید در رجیستری، مثل "shape.rectangle"
  position: { x: number; y: number };
  params: Record<string, ParamValue>;   // مقادیر پارامترهای ثابت
  state: {
    bypassed: boolean;          // mute/bypass flag
    isOutput: boolean;          // display/output flag
    collapsed: boolean;
    color?: string;
    title?: string;             // نام دلخواه کاربر
  };
  // برای زیرگراف‌ها:
  subgraph?: GraphModel;
}

interface Edge {
  id: EdgeId;
  from: { node: NodeId; port: string };  // خروجی
  to:   { node: NodeId; port: string };  // ورودی
}
```

### ۶.۲ تعریف نوع نود (Node Definition)

نودها **داده** هستند نه کلاس‌های UI. هر نوع نود با یک توصیف ثبت می‌شود:

```ts
interface NodeDefinition<P = any> {
  type: string;                     // "modifier.offsetPath"
  category: NodeCategory;           // برای منوی افزودن
  label: string;
  inputs: PortSpec[];
  outputs: PortSpec[];
  params: ParamSpec[];              // ویجت‌های اینسپکتور
  // تابع خالص محاسبه: قلب نود
  compute(ctx: EvalContext, inputs: PortValues, params: P): PortValues;
  // اختیاری: پیش‌نمایش سفارشی، آیکن، توضیح
}

interface PortSpec {
  key: string;
  label: string;
  dataType: DataType;               // "scene" | "number" | "color" | ...
  multi?: boolean;                  // آیا چند اتصال ورودی می‌پذیرد (مثلاً merge)
  defaultValue?: ParamValue;        // وقتی متصل نیست
}

interface ParamSpec {
  key: string;
  label: string;
  widget: 'number' | 'slider' | 'color' | 'vector2' | 'toggle'
        | 'select' | 'text' | 'angle' | 'curve' | 'gradient';
  dataType: DataType;
  min?: number; max?: number; step?: number;
  options?: { label: string; value: ParamValue }[];
  // قابلیت ارجاع/عبارت (مثل channel references هودینی)
  bindable?: boolean;
}
```

### ۶.۳ سیستم نوع و سازگاری اتصال‌ها

```ts
type DataType =
  | 'scene' | 'path' | 'number' | 'vector2' | 'color'
  | 'boolean' | 'string' | 'angle' | 'gradient' | 'style'
  | 'transform' | `field<${string}>`;
```

قوانین:

- اتصال فقط از **output** به **input** مجاز است.
- نوع‌ها باید سازگار باشند؛ یک **جدول cast** تبدیل‌های ضمنی مجاز را تعریف می‌کند (مثلاً `number → vector2` با تکرار، `color → gradient`).
- جلوگیری از **دور (cycle)**: قبل از افزودن یال، بررسی DAG.
- هر سوکت ورودی فقط یک یال می‌پذیرد، مگر `multi: true`.
- هر نوع رنگ مخصوص دارد (الهام از Blender) برای خوانایی.

---

## ۷. موتور ارزیابی (Evaluation Engine)

این بخش **قلب تپنده‌ی** سیستم و مهم‌ترین تصمیم معماری است.

### ۷.۱ مدل: Pull تنبل + Push کثیفی + Memoization

ترکیب بهترین‌های هودینی و Blender:

- **Dirty propagation (push)**: وقتی پارامتر یا اتصال نودی تغییر می‌کند، آن نود و **همه‌ی نودهای پایین‌دستش** به‌عنوان dirty علامت می‌خورند (پیمایش رو به جلو روی DAG).
- **Lazy evaluation (pull)**: ارزیابی فقط زمانی شروع می‌شود که Viewport خروجی نود(های) `isOutput` را بخواهد. موتور از نود خروجی به عقب می‌رود و فقط نودهای dirty را دوباره محاسبه می‌کند؛ بقیه از **کش** خوانده می‌شوند.
- **Memoization**: خروجی هر نود با کلیدی مبتنی بر «هش پارامترها + شناسه‌ی نسخه‌ی ورودی‌ها» کش می‌شود. اگر چیزی تغییر نکرده باشد، محاسبه رد می‌شود.

```ts
interface CacheEntry {
  inputVersions: number[];   // نسخه‌ی خروجی هر ورودی
  paramHash: string;
  outputs: PortValues;
  version: number;           // افزایش با هر بازمحاسبه
}

class Evaluator {
  private cache = new Map<NodeId, CacheEntry>();
  private dirty = new Set<NodeId>();

  markDirty(nodeId: NodeId) {
    // BFS رو به جلو روی فرزندان
    for (const n of this.downstream(nodeId)) this.dirty.add(n);
  }

  evaluate(nodeId: NodeId, ctx: EvalContext): PortValues {
    const cached = this.cache.get(nodeId);
    const inputs = this.gatherInputs(nodeId, ctx); // بازگشتی → ارزیابی والدها
    if (cached && !this.dirty.has(nodeId)
        && sameVersions(cached.inputVersions, inputs.versions)) {
      return cached.outputs;             // اصابت کش
    }
    const def = registry.get(node.type);
    const outputs = node.state.bypassed
      ? passthrough(inputs)              // bypass: ورودی را عبور بده
      : def.compute(ctx, inputs.values, node.params);
    this.cache.set(nodeId, { ...newEntry });
    this.dirty.delete(nodeId);
    return outputs;
  }
}
```

### ۷.۲ نکات کلیدی

- **EvalContext** شامل `time` (برای انیمیشن)، رزولوشن/کیفیت، و دامنه‌ی فعلی (برای فیلدها) است.
- **ارزیابی تنبل فیلدها**: مقدار `Field<T>` خودش یک closure است که موقع نیاز با یک نقطه فراخوانی می‌شود؛ نه اینکه از قبل برای همه‌ی نقاط محاسبه شود.
- **ارزیابی در Web Worker**: چون هسته خالص است، می‌توان آن را به یک worker منتقل کرد تا UI روان بماند؛ ارتباط با پیام و انتقال داده‌ی structural-clone یا transferable.
- **Incremental/Debounced**: کشیدن اسلایدر باعث rapid markDirty می‌شود؛ ارزیابی با `requestAnimationFrame` هماهنگ و throttle می‌شود.
- **تشخیص دور** قبل از اتصال، تا گراف همیشه DAG بماند (حلقه‌ها فقط با نود مخصوص Loop به‌صورت کنترل‌شده).

---

## ۸. مدل داده‌ی وکتوری که در گراف جریان دارد

مهم‌ترین تصمیم دامنه‌ای: نوع `Scene` چه شکلی است.

```ts
interface Scene {
  shapes: VectorShape[];
}

interface VectorShape {
  id: string;
  path: VectorPath;          // هندسه
  transform: Transform2D;    // ماتریس affine
  style: Style;
  attributes: AttributeMap;  // صفات دلخواه روی شکل (الهام از Houdini)
}

interface VectorPath {
  contours: Contour[];       // یک شکل می‌تواند چند کانتور داشته باشد (حفره‌ها)
}

interface Contour {
  closed: boolean;
  points: AnchorPoint[];
}

interface AnchorPoint {
  position: Vec2;
  handleIn?: Vec2;           // دسته‌ی کنترلی بِزیه (نسبی)
  handleOut?: Vec2;
  // صفات per-point برای فیلدها/مودیفایرها
  attributes?: AttributeMap;
}

interface Style {
  fill?: Paint;              // رنگ یا گرادیان
  stroke?: { paint: Paint; width: number; cap; join; dash?: number[] };
  opacity: number;
  blendMode: BlendMode;
}
```

**چرا این طراحی؟**

- مدل **بِزیه‌محور** با کانتورهای چندگانه، با SVG و عملیات بولین سازگار است.
- `attributes` روی شکل و روی نقطه، معادل سیستم attribute هودینی است و به مودیفایرها اجازه می‌دهد داده‌ی دلخواه حمل کنند (مثلاً «این نقطه از کدام کلون آمده»).
- `Transform2D` جدا از نقاط نگه داشته می‌شود تا تبدیل‌ها بدون «پخت» (bake) قابل زنجیره‌سازی باشند؛ فقط در زمان رندر یا عملیات بولین flatten می‌شوند.

---

## ۹. کتابخانه‌ی نودها (Node Library)

دسته‌بندی نودها برای منوی افزودن (الهام از Shift+A بلندر):

### Generators (مولدها) — خروجی `scene`/`path`
`Rectangle`, `Ellipse`, `Polygon`, `Star`, `Line`, `Path (دستی)`, `Text`, `Grid`, `Spiral`, `SVG Import`

### Transform & Layout
`Transform` (translate/rotate/scale)، `Mirror`، `Align`، `Distribute`، `Set Anchor`

### Modifiers (مودیفایرها) — `scene → scene`
`Offset Path`, `Round Corners`, `Simplify`, `Trim Path`, `Dash`, `Zigzag/Wave`, `Smooth`, `Twist`, `Bulge/Pucker`, `Wrap to Path`

### Boolean / Combine
`Union`, `Subtract`, `Intersect`, `Exclude`, `Merge` (multi-input)، `Group`

### Repeaters / Cloners (الهام از cloners سینمافوردی/Cavalry)
`Grid Array`, `Radial Array`, `Clone Along Path`, `Random Scatter` — هرکدام `index/count/position` را به‌عنوان **فیلد** در دسترس می‌گذارند.

### Style
`Fill`, `Stroke`, `Gradient`, `Opacity`, `Blend`, `Apply Style`

### Math / Logic / Utility
`Math`, `Vector Math`, `Map Range`, `Clamp`, `Mix`, `Compare`, `Switch`, `Random`, `Noise (1D/2D)`

### Fields (میدان‌ها) — خروجی `field<...>`
`Noise Field`, `Gradient Field`, `Radial Field`, `Distance Field`, `Curve Remap` — برای رانندگی پارامترها به ازای هر نقطه/کلون.

### Input / Output
`Number`, `Color`, `Slider`, `Time`, `Viewport Output`, `Export (SVG/PNG)`

> هر نود فقط یک `NodeDefinition` با `compute` خالص است. افزودن نود جدید = افزودن یک فایل تعریف + ثبت در رجیستری. این کلید **توسعه‌پذیری** است.

---

## ۱۰. زیرگراف‌ها، گروه‌ها و کپسوله‌سازی

الهام از Node Group بلندر و Subnetwork هودینی:

- کاربر چند نود را انتخاب و **«Group»** می‌کند → یک نود جدید با `subgraph` ساخته می‌شود.
- نودهای ویژه‌ی **`Group Input`** و **`Group Output`** مرز ورودی/خروجی زیرگراف را تعریف می‌کنند.
- پارامترهای داخلی می‌توانند **Expose** شوند تا روی نود گروه به‌عنوان پارامتر ظاهر شوند (الهام از Substance).
- امکان **«شیرجه»** (double-click → dive in) برای ویرایش داخل گروه، با breadcrumb برای ناوبری.
- گروه‌ها قابل ذخیره به‌عنوان **«دارایی قابل‌استفاده‌ی مجدد»** در کتابخانه‌ی کاربر (Asset library) هستند.

ارزیابی زیرگراف بازگشتی است: نود گروه هنگام `compute`، ورودی‌هایش را به `Group Input` داخلی تزریق و خروجی `Group Output` را برمی‌گرداند؛ کش به‌صورت تو‌در‌تو کار می‌کند.

---

## ۱۱. لایه‌ی رابط کاربری با React

### ۱۱.۱ چیدمان کلی (Workspace)

```
┌────────────────────────────────────────────────────────────┐
│  Toolbar (file, undo/redo, play, export, quality)           │
├──────────┬──────────────────────────────────┬──────────────┤
│ Outliner │            Viewport              │  Inspector    │
│ (لیست    │   (رندر زنده‌ی Scene خروجی)        │  (پارامترهای  │
│  شکل‌ها)  │                                  │   نود انتخابی) │
├──────────┴──────────────────────────────────┴──────────────┤
│                      Node Canvas (گراف)                      │
│              + Search/Add palette  + minimap                │
└────────────────────────────────────────────────────────────┘
```

پنل‌ها قابل docking/resize (با کتابخانه‌ای مثل `react-resizable-panels` یا `dockview`).

### ۱۱.۲ بوم نود: React Flow (xyflow)

برای بوم گراف از **React Flow** استفاده می‌شود چون pan/zoom، کشیدن یال، minimap، انتخاب و... را آماده دارد. اما:

- React Flow فقط **لایه‌ی ارائه** است؛ **منبع حقیقت، `GraphModel` در store است**، نه state داخلی React Flow.
- نودها و یال‌های React Flow از روی `GraphModel` مشتق می‌شوند (selector).
- نودهای سفارشی (custom node renderers) سوکت‌های رنگی، عنوان، پرچم‌ها، و **پیش‌نمایش درون‌خطی** (thumbnail خروجی نود، الهام از Substance) را نشان می‌دهند.
- اعتبارسنجی اتصال (`isValidConnection`) از سیستم نوع هسته استفاده می‌کند.

### ۱۱.۳ Inspector

از روی `ParamSpec[]` نود انتخاب‌شده، **به‌صورت داده‌محور (data-driven)** ویجت‌ها رندر می‌شوند. یک نگاشت `widget → React component` کفایت می‌کند؛ افزودن ویجت جدید بدون تغییر اینسپکتور.

### ۱۱.۴ Palette / Search

منوی افزودن نود با جست‌وجوی فازی روی `label`/`category` (الهام از Shift+A). افزودن با drag یا Enter.

---

## ۱۲. مدیریت وضعیت، فرمان‌ها و Undo/Redo

### ۱۲.۱ Zustand به‌عنوان store

دلیل انتخاب Zustand: سبک، بدون boilerplate، **selectorهای ریز** برای جلوگیری از re-render کل بوم هنگام تغییر یک نود. (Redux Toolkit هم گزینه‌ی معتبری است اما برای اپ‌های canvasی Zustand رایج‌تر و چابک‌تر است.)

تفکیک state:

- **Document state** (ماندگار): `GraphModel`، تنظیمات سند. → سریال و undo می‌شود.
- **Session/UI state** (گذرا): انتخاب، موقعیت دوربین، پنل‌ها، حالت ابزار. → undo نمی‌شود.

### ۱۲.۲ الگوی Command + Patch-based Undo/Redo

همه‌ی جهش‌های سند از طریق **command bus** انجام می‌شود؛ از **Immer** برای تولید patch/inverse-patch استفاده می‌شود:

```ts
interface Command {
  type: string;
  apply(draft: DocumentState): void;   // با Immer → patches خودکار
  label: string;                       // برای نمایش در تاریخچه
}

// تاریخچه = پشته‌ای از { patches, inversePatches }
// undo = اعمال inversePatches ، redo = اعمال patches
```

مزیت: undo/redo دقیق و سبک (فقط دلتاها)، قابل ادغام (coalesce) برای حرکات پیوسته مثل کشیدن اسلایدر، و سازگار با همگام‌سازی شبکه‌ای آینده (CRDT/collab) چون همه‌چیز به‌صورت تغییرات گسسته است.

هر `apply` که `GraphModel` را تغییر دهد، **`evaluator.markDirty`** را برای نودهای متأثر صدا می‌زند تا ارزیابی مجدد در فریم بعد رخ دهد.

---

## ۱۳. Viewport و رندر خروجی وکتور

### ۱۳.۱ گزینه‌های رندر

| فناوری | مزیت | کاربرد |
|---|---|---|
| **SVG (DOM)** | ساده، بُرداری خالص، export آسان، تعامل/hit-test راحت | پیش‌فرض و خروجی نهایی |
| **Canvas 2D** | سریع‌تر برای تعداد زیاد شکل، بدون فشار DOM | حالت کارایی بالا |
| **WebGL (PixiJS / Regl)** | افکت‌ها، blend mode پیشرفته، صدها هزار کلون | حالت heavy/افکت |

طراحی: یک **interface رندر مجرد (`Renderer`)** که چند backend دارد و بر اساس پیچیدگی صحنه/کیفیت سوییچ می‌کند. خروجی export همیشه از مسیر SVG تولید می‌شود (وکتور خالص).

### ۱۳.۲ کتابخانه‌ی هندسه

برای محاسبات (عملیات بولین، آفست، بِزیه)، گزینه‌ها:

- **paper.js** — کامل‌ترین: boolean ops، بِزیه، hit-test (سنگین‌تر، می‌تواند هسته‌ی هندسی headless باشد).
- ترکیب سبک: **`polygon-clipping`** (بولین) + **`bezier-js`** + **`flatten-js`** (هندسه).

پیشنهاد: لایه‌ی هندسه پشت یک **adapter** پنهان شود تا بتوان backend را عوض کرد.

### ۱۳.۳ تعامل Viewport ↔ Graph

- انتخاب شکل در Viewport → هایلایت نود مولدش در گراف (با ردیابی `attributes.sourceNode`).
- ویرایش مستقیم (مثلاً جابه‌جا کردن نقطه) روی نود مولد قابل ویرایش، پارامتر آن نود را تغییر می‌دهد (نه bake) — مدل non-destructive حفظ می‌شود.

---

## ۱۴. انیمیشن و وابستگی به زمان

الهام از Cavalry/TouchDesigner:

- نود **`Time`** مقدار زمان جاری (`ctx.time`) را به گراف تزریق می‌کند؛ هر نودی که از آن تغذیه کند **time-dependent** علامت می‌خورد.
- یک **Timeline / playhead** در UI؛ هنگام پخش، `ctx.time` در هر فریم تغییر می‌کند و فقط شاخه‌های وابسته به زمان dirty می‌شوند (بقیه از کش).
- پشتیبانی از **keyframe** روی پارامترها به‌عنوان لایه‌ی روی پارامتر (هر `bindable` param می‌تواند به‌جای مقدار ثابت، یک منحنی انیمیشن داشته باشد).
- خروجی انیمیشن: رندر فریم‌به‌فریم به PNG sequence یا Lottie/SVG SMIL.

---

## ۱۵. سریال‌سازی و فرمت فایل

- فرمت سند: **JSON نسخه‌دار** شامل `GraphModel` + متادیتا + assetها.
- **مهاجرت نسخه (migrations)**: هر افزایش `version` یک تابع migration دارد تا فایل‌های قدیمی باز شوند.
- نودهای ناشناخته (از افزونه‌ی نصب‌نشده) به‌صورت **placeholder** حفظ می‌شوند تا داده گم نشود.
- ذخیره‌ی محلی با IndexedDB + امکان export/import فایل `.ndr`.
- آمادگی برای **collab** آینده: چون state مبتنی بر patch است، انتقال به Yjs/CRDT کم‌هزینه است.

---

## ۱۶. توسعه‌پذیری و سیستم افزونه

- **رجیستری نود باز**: افزونه‌ها `NodeDefinition` ثبت می‌کنند. هسته از پیش هیچ نودی را hard-code نمی‌کند.
- یک **SDK نود** با API پایدار: `defineNode({...})`، دسترسی به کتابخانه‌ی هندسه و انواع.
- نودهای ساخته‌شده توسط کاربر (Node Groups) هم به‌صورت دارایی export/import می‌شوند.
- امکان نودهای مبتنی بر **کد کاربر** (مثل Wrangle هودینی): یک نود `Expression/Script` که کد کوچک TS/expression ایمن (sandbox) اجرا می‌کند.

---

## ۱۷. پشته‌ی فناوری پیشنهادی

| لایه | انتخاب | دلیل |
|---|---|---|
| زبان | **TypeScript** | ایمنی نوع برای سیستم نوع گراف حیاتی است |
| بیلد | **Vite** | سریع، HMR عالی |
| UI | **React 18+** | درخواست کاربر |
| بوم نود | **React Flow (xyflow)** | pan/zoom/edge آماده و قابل سفارشی‌سازی |
| State | **Zustand + Immer** | سبک، selector ریز، patch برای undo |
| هندسه | **paper.js** یا `polygon-clipping`+`bezier-js` | عملیات بولین/بِزیه |
| رندر | **SVG** (پیش‌فرض) + Canvas/Pixi (کارایی) | وکتور خالص + مقیاس‌پذیری |
| پنل‌ها | **react-resizable-panels** / dockview | چیدمان قابل تنظیم |
| تست | **Vitest** (هسته) + **Playwright** (E2E) | هسته‌ی خالص آسان تست می‌شود |
| Worker | **Comlink** | اجرای ارزیابی در worker |

---

## ۱۸. ساختار پوشه‌ها

```
nodeditor/
├─ docs/
│  └─ ARCHITECTURE.md
├─ packages/
│  ├─ core/                      # هسته‌ی خالص، بدون React
│  │  ├─ graph/                  # GraphModel، Edge، عملیات گراف
│  │  ├─ types/                  # DataType، سیستم نوع، جدول cast
│  │  ├─ eval/                   # Evaluator، dirty tracking، cache
│  │  ├─ registry/               # NodeRegistry، defineNode
│  │  └─ serialization/          # ذخیره/بارگذاری + migrations
│  ├─ geometry/                  # کتابخانه‌ی هندسه‌ی وکتور
│  │  ├─ path.ts  bezier.ts  boolean.ts  transform.ts  fields.ts
│  ├─ nodes/                     # تعریف نودها (داده، نه UI)
│  │  ├─ generators/  modifiers/  boolean/  repeaters/
│  │  ├─ style/  math/  fields/  io/
│  └─ render/                    # backendهای رندر (svg/canvas/webgl)
├─ apps/
│  └─ studio/                    # اپ React
│     ├─ src/
│     │  ├─ store/               # Zustand store، commands، history
│     │  ├─ components/
│     │  │  ├─ NodeCanvas/       # React Flow + custom nodes
│     │  │  ├─ Inspector/        # ویجت‌های داده‌محور
│     │  │  ├─ Viewport/         # رندر زنده
│     │  │  ├─ Outliner/  Palette/  Timeline/  Toolbar/
│     │  ├─ hooks/  styles/  main.tsx
└─ package.json (monorepo: pnpm workspaces)
```

ساختار **monorepo** تا مرز هسته/UI به‌صورت فیزیکی تضمین شود و هسته مستقل منتشر/تست شود.

---

## ۱۹. ملاحظات کارایی

1. **ارزیابی افزایشی**: فقط نودهای dirty؛ کش برای بقیه. مهم‌ترین اهرم کارایی.
2. **selectorهای ریز Zustand**: تغییر یک نود نباید کل بوم را re-render کند.
3. **مجازی‌سازی**: در بوم‌های بزرگ، فقط نودهای داخل viewport رندر شوند (React Flow `onlyRenderVisibleElements`).
4. **Web Worker**: ارزیابی سنگین خارج از thread اصلی با Comlink.
5. **سطح کیفیت (LOD)**: حین تعامل با کیفیت پایین (تعداد کلون/نمونه کمتر) و در حالت idle با کیفیت کامل رندر شود.
6. **پیش‌نمایش‌های throttle‌شده**: thumbnailهای درون‌نودی با تأخیر و در worker تولید شوند.
7. **داده‌ی غیرتغییرناپذیر مشترک**: خروجی‌های کش‌شده immutable باشند تا اشتراک‌گذاری امن و مقایسه‌ی ارجاعی ممکن باشد.

---

## ۲۰. نقشه‌ی راه پیاده‌سازی (فازبندی)

> فازها بر اساس وابستگی فنی مرتب شده‌اند، نه زمان تقویمی.

**فاز ۰ — اسکلت و زیرساخت**
monorepo، Vite، TypeScript، چیدمان پنل‌ها، یکپارچه‌سازی اولیه‌ی React Flow با store.

**فاز ۱ — هسته‌ی گراف**
`GraphModel`، رجیستری نود، سیستم نوع، Evaluator با dirty/cache. تست واحد با Vitest روی نودهای ساختگی.

**فاز ۲ — حداقل دامنه‌ی وکتور**
نوع `Scene`، چند نود مولد (Rectangle/Ellipse)، `Transform`، `Fill/Stroke`، نود `Output`، Viewport SVG. اولین «گراف زنده»‌ی واقعی.

**فاز ۳ — UI کامل گراف**
نودهای سفارشی با سوکت رنگی و پرچم‌ها، Inspector داده‌محور، Palette/Search، Undo/Redo مبتنی بر patch، سریال‌سازی.

**فاز ۴ — قدرت پروسیجرال**
عملیات بولین، مودیفایرها (Offset/Round/Trim)، Repeater/Cloner، سیستم `Field`، پیش‌نمایش درون‌خطی.

**فاز ۵ — کپسوله‌سازی و انیمیشن**
Node Group/Subgraph، expose پارامتر، نود `Time` و Timeline و keyframe.

**فاز ۶ — مقیاس و توسعه‌پذیری**
ارزیابی در Web Worker، backend رندر Canvas/WebGL، SDK افزونه، export (SVG/PNG/Lottie)، کتابخانه‌ی دارایی.

---

### جمع‌بندی یک‌خطی

یک **هسته‌ی گراف خالص و مستقل از UI** با **ارزیابی تنبلِ مبتنی بر کثیفی و کش**، که داده‌ی اصلی‌اش یک **Scene بِزیه‌محور با صفات** است، نودها را به‌صورت **تعریف‌های داده‌محور قابل ثبت** نگه می‌دارد، روی یک **بوم React Flow با منبع‌حقیقتِ Zustand** نمایش داده می‌شود و خروجی را به **SVG/Canvas/WebGL** رندر می‌کند — این ستون فقرات یک «هودینیِ وکتور دوبعدی روی وب» است.
