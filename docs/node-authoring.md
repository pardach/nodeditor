# راهنمای افزودن نود جدید

برای اضافه کردن نود، یک `NodeDefinition` pure بسازید و آن را به `nodeDefinitions` در `src/core/nodes/registry.ts` اضافه کنید.

## الگوی پایه

```ts
import type { NodeDefinition } from "../../types/graph";

export const myNode: NodeDefinition = {
  type: "operation.my-node",
  label: "My Node",
  category: "operation",
  description: "Does one clear procedural operation.",
  inputs: [
    {
      id: "geometry",
      label: "Geometry",
      direction: "input",
      dataType: "geometry",
      required: true,
    },
  ],
  outputs: [{ id: "geometry", label: "Geometry", direction: "output", dataType: "geometry" }],
  parameters: [{ id: "amount", label: "Amount", dataType: "number", defaultValue: 1, step: 0.1 }],
  evaluate: ({ inputs, parameters }) => {
    // بدون mutation و بدون دسترسی به React/browser state
    return {
      outputs: {
        geometry: inputs.geometry,
      },
    };
  },
};
```

## قوانین

1. `type` باید پایدار و namespaceدار باشد؛ مثلا `geometry.rectangle` یا `material.fill`.
2. `evaluate` باید deterministic باشد: همان ورودی و پارامتر، همان خروجی.
3. مقدار پیش‌فرض ورودی‌های required را در socket تعریف کنید تا graph ناقص هم preview امن داشته باشد.
4. اگر نود نمی‌تواند خروجی معتبر تولید کند، diagnostics بدهید؛ exception فقط برای خطای برنامه‌نویسی است.
5. عملیات هندسی مشترک را در `src/core/geometry` قرار دهید تا تست و reuse ساده باشد.

## تست پیشنهادی

- یک تست برای خروجی happy path
- یک تست برای ورودی خالی یا ناسازگار
- اگر نود geometry را تغییر می‌دهد، تست روی path data یا ساختار shape
