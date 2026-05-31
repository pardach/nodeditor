# معماری Node Vector Studio

این سند قرارداد معماری محصول را توضیح می‌دهد: یک نرم‌افزار طراحی وکتوری دوبعدی که خروجی آن از یک گراف procedural ساخته می‌شود. الهام اصلی از سه خانواده سیستم است:

- **Blender Geometry/Shader Nodes**: تجربه تعاملی، socketهای رنگی، پیش‌نمایش زنده و node groups.
- **Houdini SOPs**: DAG صریح، cooking/evaluation مرحله‌ای، cache و procedural history.
- **Substance Painter/Designer**: non-destructive workflow، پارامترهای قابل key/override و خروجی قابل export.

## لایه‌ها

```txt
React App Shell
├─ Node Graph UI          نمایش و تعامل با DAG
├─ Vector Viewport        نمایش خروجی evaluated geometry
├─ Inspector              ویرایش پارامترهای نود
└─ Document Store         command history، selection، undo/redo

Core Domain (بدون React)
├─ Graph Types            node، edge، socket، document
├─ Node Registry          تعریف نودها و قرارداد evaluate
├─ Evaluation Engine      type check، topological sort، diagnostics
└─ Geometry Core          path، transform، style، SVG conversion
```

## جریان داده

1. کاربر یک command اجرا می‌کند؛ مثلا تغییر `width` نود Rectangle.
2. `documentStore` یک `GraphDocument` جدید می‌سازد و نسخه قبلی را در history نگه می‌دارد.
3. `AppShell` سند جدید را به `evaluateGraph` می‌دهد.
4. evaluator ابتدا typeها و cycleها را بررسی می‌کند، سپس نودها را به‌ترتیب topological اجرا می‌کند.
5. خروجی `output.document` به `VectorViewport` می‌رود.
6. Inspector و Node Graph از همان سند و diagnostics استفاده می‌کنند.

## مدل سند

`GraphDocument` باید تنها منبع حقیقت باشد:

- `nodes`: نمونه‌های نود با موقعیت، نوع و پارامترها
- `edges`: اتصال خروجی یک نود به ورودی نود دیگر
- `activeOutputNodeId`: خروجی اصلی viewport/export
- `view`: selection، zoom و pan گراف
- `metadata`: نسخه schema و زمان‌های تغییر

این تفکیک باعث می‌شود ذخیره‌سازی JSON، migration و collaborative editing بعدی ساده‌تر باشد.

## نودها و socketها

هر نود یک `NodeDefinition` دارد:

- `inputs` و `outputs` با `GraphDataType`
- `parameters` با مقدار پیش‌فرض و metadata UI
- تابع `evaluate` بدون side effect

در آینده می‌توان categoryهای زیر را گسترش داد:

- Geometry: rectangle، ellipse، pen path، text outline
- Operations: transform، boolean، offset، repeat، scatter
- Materials: fill، stroke، gradient، pattern
- Utility: number، color ramp، switch، group input/output
- Output: viewport، export SVG، export PNG

## ارزیابی و cache

نسخه فعلی کل DAG را دوباره ارزیابی می‌کند. مسیر توسعه بعدی:

1. محاسبه hash برای node parameters و ورودی‌ها
2. cache per-node براساس hash
3. invalidation فقط برای downstream nodes
4. worker thread برای عملیات هندسی سنگین مثل boolean/offset

## تصمیم‌های UX برگرفته از ابزارهای حرفه‌ای

- **Blender**: افزودن سریع نود از palette/search، preview زنده، socketهای تایپ‌شده.
- **Houdini**: خروجی active، chain procedural، diagnostics قابل ردیابی روی هر نود.
- **Substance**: همه تغییرات non-destructive و قابل undo، parameter-first workflow.

## مرزهای مهم

- UI نباید منطق geometry یا evaluation را در خود نگه دارد.
- نودها نباید React component باشند؛ UI فقط از definitionها metadata می‌خواند.
- evaluator نباید state داخلی mutable داشته باشد.
- serialization باید با schemaVersion انجام شود، نه با shape تصادفی state داخلی React.
