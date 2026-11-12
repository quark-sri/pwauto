# BUG-001: Valid billing address is randomly rejected at checkout

| | |
|---|---|
| Found by | pwauto example suite (`@checkout` scenarios), repeated parallel runs |
| Date | 2026-11-12 |
| Environment | https://practicesoftwaretesting.com (public practice site, Toolshop v5.0) |
| Severity | High — the customer cannot place the order |
| Frequency | intermittent: 4 of 10 runs |
| Scenario | `examples/toolshop/features/shopping/checkout.feature` (tagged `@fixme @known-bug`) |

## Steps

1. Register a new customer and sign in.
2. Add one "Pliers" to the cart and check out.
3. Billing address: country Austria, postal code 1010, house number, street, city Vienna, state Vienna.
4. Choose "Cash on Delivery" (or "Bank Transfer" with bank details), "Check payment", then "Confirm".

## Expected

"Thanks for your order! Your invoice number is INV-…" ([Order](../knowledge/ordering/entities/order.md)). Vienna is in Austria, so the address is valid ([Billing address validation](../knowledge/ordering/rules/billing-address.md)).

## Actual

In about 40% of runs, `POST /invoices` returns **422** and no order is placed:

```json
request:  {"billing_street":"Main Street 1","billing_city":"Vienna","billing_state":"Vienna",
           "billing_country":"AT","billing_postal_code":"1010","payment_method":"cash-on-delivery", ...}
response: {"billing_country":["The billing_country does not match the entered address. The city does not belong to the selected country."]}
```

The same request is accepted in the other runs.

## Evidence

`network-errors.json` attachment of the failed tests (request and response bodies captured by the `evidence` fixture), screenshot and trace in the HTML report.

## Note

Toolshop is a training application with a "Bug Hunting" mode, so this may be a deliberate defect. The scenarios keep their assertions; remove `@fixme` to run them again.
