---
type: Area Map
title: Catalog map
description: Entities and screen navigation in the Catalog Area.
generated: { by: process:lore-build }
---

# Catalog map

Shoppers browse, search, sort and filter tools and view product details

## Entities

```mermaid
erDiagram
  Product
```

_Labels: (intended) = specified only · (actual) = seen in app or code only._

## Navigation

```mermaid
flowchart LR
  n_catalog_screens_product_catalog["Product catalog"]
  n_catalog_screens_product_details["Product details"]
  n_ordering_screens_cart["Cart"]
  n_catalog_screens_product_catalog -->|"navigates to"| n_catalog_screens_product_details
  n_catalog_screens_product_details -->|"navigates to"| n_ordering_screens_cart
  linkStyle 0 stroke:#e67e00,stroke-width:2px
  linkStyle 1 stroke:#e67e00,stroke-width:2px
  classDef gap fill:#fde2e2,stroke:#c00,color:#900
  classDef unverified color:#777,stroke:#aaa
  class n_catalog_screens_product_catalog,n_catalog_screens_product_details,n_ordering_screens_cart unverified
```

_Legend: dashed arrow = intended only (not seen in app or code) · orange arrow = actual only (not specified) · red ⚠ = open Gap · grey = unverified._
