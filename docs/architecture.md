# معماری پیشنهادی Node Pattern Studio

این سند معماری، محصول را به عنوان یک **نرم‌افزار طراحی وکتوری دو بعدی، نودمحور و غیرمخرب** تعریف می‌کند؛
تمرکز اصلی روی چاپ الگوهای لباس، آرت‌بوردهای واقعی دستگاه چاپ، ورودی SVG و خروجی قابل تولید است.

## الهام از نرم‌افزارهای مرجع

### Houdini

چیزی که از Houdini مهم است، فقط ظاهر node editor نیست؛ اصل کار در **procedural dependency graph** است:

- هر node یک operation واضح، typed input/output و پارامترهای قابل keyframe/version دارد.
- graph باید lazy evaluate شود؛ فقط nodeهایی دوباره محاسبه شوند که upstream آنها تغییر کرده است.
- node group باید به عنوان ابزار داخلی قابل ذخیره و reuse باشد؛ مثلا `Neck Border Brush` یا `Repeat for Sleeve`.
- هر خروجی باید قابل بازرسی باشد؛ کاربر بتواند نتیجه یک node وسط graph را روی canvas ببیند.

برای محصول ما:

- `Garment Block` از اندازه‌ها shape می‌سازد.
- `Pattern Tile` از SVG asset یک pattern قابل تکرار می‌سازد.
- `Path Brush` pattern را روی مسیر یقه، سرآستین یا پایین لباس پخش می‌کند.
- `Diagnostics` قبل از export ریسک‌های چاپ را گزارش می‌دهد.

### Blender / Geometry Nodes

Blender دو ایده مهم دارد: **viewport تعاملی** و **modifier stack غیرمخرب**.

- کاربر باید بتواند سریع نتیجه را در viewport ببیند، حتی اگر export نهایی سنگین‌تر و دقیق‌تر باشد.
- باید بتوان graph را مثل modifier روی یک garment layer اعمال کرد.
- asset browser برای SVG motifs، palettes، brushes و garment blocks لازم است.
- scene/document باید شامل چند artboard، چند size و چند colorway باشد.

برای محصول ما:

- React UI نقش editor و viewport را دارد.
- engine باید pure TypeScript باشد تا قابل تست و اجرای server-side برای batch export باشد.
- SVG preview می‌تواند ساده‌سازی‌شده باشد، اما export باید اندازه دقیق و واحد واقعی داشته باشد.
- هر garment می‌تواند stack خودش را داشته باشد: base block، fit adjustments، pattern fill، edge brush، export marks.

### Substance Designer / Painter

Substance الهام اصلی برای **material graph، texture variation و parameter exposure** است.

- nodeها باید پارامترهای expose شده داشته باشند تا کاربر یک graph را به template تبدیل کند.
- variation باید با seed کنترل شود، نه با دستکاری دستی غیرقابل بازتولید.
- preset و instance مهم هستند: یک pattern برای چند لباس یا چند رنگ استفاده شود.
- خروجی‌ها باید channel/variant داشته باشند؛ در چاپ لباس اینها می‌شوند colorway، layer، spot color و registration.

برای محصول ما:

- `Pattern Tile` باید seed، offset، scale، rotation، jitter و color mapping داشته باشد.
- `SVG Asset` باید palette mapping داشته باشد تا رنگ‌ها بدون تغییر فایل اصلی عوض شوند.
- `Export Queue` باید برای چند colorway و چند سایز خروجی batch بسازد.

## لایه‌های سیستم

### 1. Document Model

سند باید versioned و مستقل از UI باشد:

```ts
type VectorPatternDocument = {
  version: number;
  unit: "cm" | "mm";
  artboards: Artboard[];
  assets: SvgAsset[];
  graphs: NodeGraph[];
  garmentBlocks: GarmentBlock[];
  exportJobs: ExportJob[];
};
```

ویژگی‌های مهم:

- همه اندازه‌ها در واحد واقعی ذخیره شوند.
- assetها با id و hash نگهداری شوند تا cache معتبر بماند.
- nodeها فقط state لازم خود را نگه دارند، نه خروجی محاسبه‌شده را.
- خروجی‌های محاسبه‌شده در cache جداگانه ذخیره شوند.

### 2. Node Registry

هر node باید contract مشخص داشته باشد:

- `type`: شناسه پایدار.
- `inputs` و `outputs`: portهای typed.
- `parameters`: schema برای UI و validation.
- `evaluate`: تابع pure برای تبدیل ورودی‌ها به خروجی‌ها.
- `preview`: representation سبک برای viewport.
- `export`: representation دقیق برای خروجی تولید.

نمونه خانواده nodeها:

- Source: `Machine Profile`, `Garment Block`, `SVG Asset`, `Size Table`, `Palette`.
- Vector: `Offset Path`, `Boolean`, `Clip`, `Mirror`, `Deform Along Path`.
- Pattern: `Tile`, `Scatter`, `Stripe`, `Radial Repeat`, `Half Drop Repeat`.
- Brush: `Path Brush`, `Corner Brush`, `Border Brush`, `Start/End Cap`.
- Analysis: `Bleed Check`, `Scale Check`, `Ink Coverage`, `Collision Check`.
- Output: `SVG Export`, `PDF Export`, `Batch Queue`, `RIP Metadata`.

### 3. Evaluation Engine

Engine باید از React جدا باشد.

مراحل پیشنهادی:

1. ساخت dependency graph از nodeها و edgeها.
2. topological sort و تشخیص cycle.
3. validation type portها.
4. اجرای lazy بر اساس dirty flags و content hash.
5. تولید `PreviewGeometry` برای viewport و `ProductionGeometry` برای export.
6. تولید diagnostics در کنار خروجی.

برای MVP فعلی، `src/domain/evaluator.ts` فقط تحلیل ساده انجام می‌دهد؛ اما جای آن درست انتخاب شده است تا بعدا به engine واقعی تبدیل شود.

### 4. Geometry Core

چون محصول وکتوری است، نباید همه چیز به stringهای SVG محدود شود.

مدل میانی پیشنهادی:

```ts
type VectorShape =
  | { kind: "path"; commands: PathCommand[]; style: VectorStyle }
  | { kind: "group"; children: VectorShape[]; transform?: Transform }
  | { kind: "pattern"; tile: VectorShape; repeat: RepeatOptions };
```

مزیت:

- boolean، offset و transform بدون parse مداوم SVG ممکن می‌شود.
- export به SVG/PDF/Canvas/WebGL از یک مدل مشترک انجام می‌شود.
- تست واحد برای geometry ساده‌تر می‌شود.

### 5. UI Architecture در React

UI بهتر است به چند workspace تقسیم شود:

- `NodeGraphPanel`: ساخت و اتصال nodeها.
- `CanvasViewport`: preview سریع، انتخاب، zoom، guides و rulers.
- `InspectorPanel`: پارامترهای node انتخاب‌شده.
- `AssetBrowser`: SVG motifs، paletteها، brush presets و garment blocks.
- `DiagnosticsPanel`: هشدارهای چاپ و مشکلات graph.
- `ExportPanel`: صف خروجی، چند سایز، چند colorway و naming rules.

React نباید منطق geometry یا export را در componentها نگه دارد؛ componentها باید فقط state را به domain layer بدهند و snapshot بگیرند.

### 6. Print Production Layer

چیزهایی که برای چاپ لباس حیاتی هستند:

- واحد واقعی cm/mm و تبدیل دقیق به px برای preview.
- bleed، safe area، registration marks و grain direction.
- چند عرض دستگاه و nesting چند قطعه روی رول.
- colorway، spot color، overprint و محدودیت رنگ.
- export batch برای سایزها، یقه‌ها، آستین‌ها و دستگاه‌های مختلف.
- ذخیره metadata: دستگاه، عرض، سفارش، سایز، نسخه graph و hash assetها.

## تصمیم معماری فعلی در کد

در این مرحله، ساختار اولیه به این سمت حرکت کرده است:

- `src/domain/types.ts`: typeهای سند، node، port، قابلیت‌ها و snapshot.
- `src/domain/nodeRegistry.ts`: registry اولیه nodeهای سیستم.
- `src/domain/evaluator.ts`: ارزیابی ساده graph و diagnostics.
- `src/domain/flowGraph.ts`: تبدیل registry و snapshot به nodeهای React Flow.
- `src/domain/presets.ts`: profileهای دستگاه و مقدارهای پیش‌فرض.
- `src/App.tsx`: فقط composition UI، کنترل ورودی‌ها و نمایش خروجی.

## اصل طراحی محصول

اگر این محصول قرار است واقعا جای بخشی از Illustrator + extensionهای چاپی را بگیرد، باید سه اصل حفظ شود:

1. **غیرمخرب بودن**: کاربر هر زمان بتواند اندازه لباس، عرض دستگاه یا motif را عوض کند و کل خروجی بازتولید شود.
2. **اندازه واقعی**: هر چیزی روی canvas باید رابطه مستقیم با واحد چاپ داشته باشد.
3. **قابل تولید بودن**: خروجی فقط زیبا نباشد؛ باید diagnostics، metadata و batch export داشته باشد.
