# nodeditor

ویرایشگر نود **وکتوری ۲بعدی** — معماری الهام‌گرفته از Blender / Houdini / Substance Painter.

## مستندات

- [معماری کامل (فارسی)](docs/ARCHITECTURE.md)

## ساختار

```
src/core/     — مدل سند، ارزیابی DAG، دستورات undo
src/nodes/    — رجیستری و نودهای builtin
src/geometry/ — هندسه ۲بعدی (توسعهٔ بعدی)
```

## توسعه

```bash
npm install
npm test
npm run typecheck
```

## وضعیت

- **M0 (فعلی):** هستهٔ TypeScript + نود Rectangle / Translate / Reroute + تست ارزیابی
- **M1:** UI React + canvas (xyflow)
- **M2:** boolean paths + viewport SVG
