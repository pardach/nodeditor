# Node Pattern Studio

نمونه اولیه یک ابزار React برای طراحی نودی الگوهای چاپ لباس با خروجی SVG.
هدف محصول، نزدیک کردن چند جریان کاری رایج Illustrator مانند `Pattern Make`،
`Pattern Brush` و ساخت آرت‌بوردهای متناسب با عرض دستگاه چاپ به یک محیط
پارامتریک شبیه Houdini، Blender Geometry Nodes یا Substance Designer است.

## مسئله‌ای که پوشش داده می‌شود

- ساخت آرت‌بورد بر اساس عرض دستگاه‌های چاپ مثل 60، 90، 105، 160 و 180 سانتی‌متر.
- دریافت اندازه‌های لباس، از جمله عرض، قد، عرض یقه و افت یقه.
- نمایش الگوی لباس روی بوم SVG با `clipPath` و تکرار موتیف با `pattern`.
- مدل‌سازی مفهومی گره‌هایی مثل ورودی دستگاه، ورودی سایزبندی، موتیف SVG،
  Pattern Make، Pattern Brush و خروجی چاپ.

## اجرای پروژه

```bash
npm install
npm run dev
```

برای ساخت نسخه production:

```bash
npm run build
```

## مسیر توسعه پیشنهادی

1. ایمپورت فایل‌های SVG واقعی و تبدیل هر فایل به node منبع.
2. اضافه کردن node engine برای محاسبه وابستگی‌ها، cache و invalidation.
3. پشتیبانی از سایزبندی لباس، گریدینگ و چند آرت‌بورد هم‌زمان.
4. پیاده‌سازی nodeهای وکتوری مثل offset path، boolean، scatter، tiling و brush روی مسیر.
5. خروجی دقیق SVG/PDF با واحدهای چاپی، bleed، registration mark و metadata دستگاه.

## معماری

برای نگاه عمیق‌تر به الهام از Houdini، Blender Geometry Nodes و Substance Designer،
و اینکه این ایده‌ها چگونه به مدل سند، node registry، evaluation engine، geometry core،
viewport و export pipeline تبدیل می‌شوند، سند زیر را ببینید:

- [docs/architecture.md](docs/architecture.md)
