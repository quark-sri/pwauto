---
type: Area Map
title: Catalog map
description: Entities and screen navigation in the Catalog Area.
generated: { by: process:lore-build }
---

# Catalog map

Home page and the shop list of toys with prices and Buy buttons

## Entities

```mermaid
erDiagram
  Product
```

_Labels: (intended) = specified only · (actual) = seen in app or code only._

## Navigation

```mermaid
flowchart LR
  n_catalog_screens_home["Home"]
  n_catalog_screens_shop["Shop"]
  n_account_screens_login_dialog["Login dialog"]
  n_ordering_screens_cart["Cart"]
  n_support_screens_contact["Contact"]
  n_catalog_screens_home -->|"navigates to"| n_catalog_screens_shop
  n_catalog_screens_home -->|"navigates to"| n_support_screens_contact
  n_catalog_screens_home -->|"navigates to"| n_account_screens_login_dialog
  n_catalog_screens_shop -->|"navigates to"| n_ordering_screens_cart
  linkStyle 0 stroke:#e67e00,stroke-width:2px
  linkStyle 1 stroke:#e67e00,stroke-width:2px
  linkStyle 2 stroke:#e67e00,stroke-width:2px
  linkStyle 3 stroke:#e67e00,stroke-width:2px
  classDef gap fill:#fde2e2,stroke:#c00,color:#900
  classDef unverified color:#777,stroke:#aaa
  class n_catalog_screens_home,n_catalog_screens_shop,n_account_screens_login_dialog,n_ordering_screens_cart,n_support_screens_contact unverified
```

_Legend: dashed arrow = intended only (not seen in app or code) · orange arrow = actual only (not specified) · red ⚠ = open Gap · grey = unverified._
