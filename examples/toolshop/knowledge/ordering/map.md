---
type: Area Map
title: Ordering map
description: Entities and screen navigation in the Ordering Area.
generated: { by: process:lore-build }
---

# Ordering map

Shoppers collect products in a cart and check out to place an order

## Entities

```mermaid
erDiagram
  Cart
  Order
  Cart ||--o{ Product : "has (actual)"
  Order ||--o{ Cart : "has (actual)"
```

_Labels: (intended) = specified only · (actual) = seen in app or code only._

## Navigation

```mermaid
flowchart LR
  n_ordering_screens_cart["Cart"]
  n_ordering_screens_checkout["Checkout"]
  n_ordering_screens_cart -->|"navigates to"| n_ordering_screens_checkout
  linkStyle 0 stroke:#e67e00,stroke-width:2px
  classDef gap fill:#fde2e2,stroke:#c00,color:#900
  classDef unverified color:#777,stroke:#aaa
  class n_ordering_screens_cart,n_ordering_screens_checkout unverified
```

_Legend: dashed arrow = intended only (not seen in app or code) · orange arrow = actual only (not specified) · red ⚠ = open Gap · grey = unverified._
