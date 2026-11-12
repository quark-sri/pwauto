---
type: Area Map
title: Account map
description: Entities and screen navigation in the Account Area.
generated: { by: process:lore-build }
---

# Account map

Customers sign in, sign out and manage their account

## Navigation

```mermaid
flowchart LR
  n_account_screens_login["Login"]
  n_account_screens_my_account["My account"]
  n_account_screens_login -->|"navigates to"| n_account_screens_my_account
  linkStyle 0 stroke:#e67e00,stroke-width:2px
  classDef gap fill:#fde2e2,stroke:#c00,color:#900
  classDef unverified color:#777,stroke:#aaa
  class n_account_screens_login,n_account_screens_my_account unverified
```

_Legend: dashed arrow = intended only (not seen in app or code) · orange arrow = actual only (not specified) · red ⚠ = open Gap · grey = unverified._
