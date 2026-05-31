# Node Vector Studio

یک اسکلت React/TypeScript برای نرم‌افزار طراحی وکتوری دوبعدی مبتنی بر نود. ایده‌ی اصلی از Node Editorهای Blender، Houdini و Substance گرفته شده است: گراف باید procedural، تایپ‌شده، قابل ارزیابی مجدد و جدا از UI باشد.

## چرا این معماری؟

- **Graph جدا از Scene**: نودها دستور ساخت خروجی هستند؛ viewport فقط نتیجه‌ی ارزیابی‌شده را نشان می‌دهد.
- **Evaluation pure**: موتور DAG در `src/core` به React وابسته نیست و با تست واحد پوشش داده می‌شود.
- **Typed sockets**: اتصال‌ها براساس نوع‌هایی مثل `geometry`، `number` و `color` اعتبارسنجی می‌شوند.
- **Command-driven state**: تغییرات سند از مسیر command عبور می‌کنند تا undo/redo و history قابل توسعه بماند.
- **Node authoring ساده**: اضافه کردن نود جدید یعنی افزودن یک `NodeDefinition` pure به registry.

## ساختار پروژه

```txt
src/
  app/                  # پوسته برنامه و چیدمان پنل‌ها
  core/
    evaluator/          # topological sort، type check و اجرای گراف
    geometry/           # عملیات path/geometry مستقل از UI
    nodes/              # registry و تعریف نودهای built-in
    types/              # مدل سند، socket، scene و primitiveها
  features/
    inspector/          # ویرایش پارامترهای نود انتخاب‌شده
    nodeGraph/          # نمایش DAG، node card و edge
    viewport/           # رندر خروجی وکتوری ارزیابی‌شده
  store/                # document store، commands و sample document
docs/
  architecture.md       # معماری محصول و جریان داده
  node-authoring.md     # راهنمای افزودن نود جدید
```

## اجرای محلی

```bash
npm install
npm run dev
npm test
npm run build
```

## وضعیت فعلی

این نسخه یک vertical slice معماری است: یک گراف نمونه‌ی `Rectangle -> Transform -> Fill -> Output` ارزیابی می‌شود، خروجی در SVG viewport دیده می‌شود، پارامترها از Inspector تغییر می‌کنند و undo/redo از طریق command history کار می‌کند.
