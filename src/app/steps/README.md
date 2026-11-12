# Your step definitions

One file per business area: `<area>.steps.ts` (for example `orders.steps.ts`).

```ts
import { expect } from '@playwright/test';
import { Given, When, Then } from '@app/fixtures';

When('I add {int} {string} to the cart', async ({ pages }, qty: number, product: string) => {
  await pages.product.addToCart(qty);
});
```

Rules: [docs/04-coding-standards.md](../../../docs/04-coding-standards.md). Steps call page
objects; Then-steps assert with `expect`. Before you write a new step, search the existing
steps (`npm run steps:list`) and reuse one when the meaning is the same.
