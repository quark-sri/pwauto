# Map

* [Ordering map](map.md) - Entities and navigation diagrams

# Entities

* [Cart](entities/cart.md) - The products a shopper has chosen, with quantity, line totals and a cart total. _(unverified)_
* [Order](entities/order.md) - A placed purchase with a billing address, payment method and an invoice number. _(unverified)_

# Rules

* [Billing address validation](rules/billing-address.md) - The billing city, state and postal code must belong to the selected country, or the order is rejected. _(unverified)_
* [Cart totals](rules/cart-totals.md) - Line total = unit price × quantity; cart total = sum of line totals. _(unverified)_

# Journeys

* [Checkout](journeys/checkout.md) - A signed-in customer pays for the cart and gets an invoice number. _(unverified)_

# Screens

* [Cart](screens/cart.md) - Step 1 of checkout, listing cart lines and totals. _(unverified)_
* [Checkout](screens/checkout.md) - Steps 2–4 of checkout - sign in, billing address and payment. _(unverified)_
