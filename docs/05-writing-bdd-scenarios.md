# 5. Writing BDD scenarios

A scenario describes one behaviour of the application in plain English, in the **Gherkin** format. It is at the same time a requirement that a business person can approve and a test that a machine runs.

## 5.1 Anatomy

```gherkin
# Knowledge: knowledge/ordering/rules/cart-totals.md      ← where the expected result comes from
@cart                                                       ← tags: area, priority, type
Feature: Shopping cart                                      ← one capability
  As a shopper                                              ← who
  I want to collect products in a cart                      ← what
  So that I can buy them together                           ← why

  Background:                                               ← a Given shared by every scenario (optional)
    Given I am on the home page

  @smoke @regression
  Scenario: The cart line total is the unit price times the quantity
    Given I have added 3 "Pliers" to the cart               ← state (set up the fastest way)
    When I open the cart                                    ← one user action
    Then the line total of "Pliers" should be 3 times its unit price   ← what the user sees
    And the cart total should equal the sum of the line totals
```

Keywords: `Feature`, `Background`, `Scenario`, `Scenario Outline` + `Examples`, `Given`, `When`, `Then`, `And`, `But`, `Rule` (group scenarios under one business rule), `#` comments, `"""` doc strings, `| tables |`.

## 5.2 Seven rules for good scenarios

| # | Rule | Bad | Good |
|---|---|---|---|
| 1 | **Declarative, not imperative** — say *what*, not *how* | `When I click "Products" And I click "+" And I click "Add to cart"` | `When I add 2 "Pliers" to the cart` |
| 2 | **One behaviour per scenario** | one scenario that logs in, searches, sorts, buys and logs out | one scenario per rule; one end-to-end journey scenario per critical flow |
| 3 | **Exact, observable results** | `Then the page should work` | `Then I should see the login error "Invalid email or password"` |
| 4 | **Independent** | scenario 2 uses the order created by scenario 1 | each scenario creates its own state in its Givens |
| 5 | **Only data that matters to the reader** | 12 address fields in the scenario | `When I check out with a new billing address` (data generated) |
| 6 | **From the knowledge base, not from today's screen** | expected text copied from a buggy page | expected text from `knowledge/` (and a Gap if the app differs) |
| 7 | **The same sentence for the same meaning** | `I log in as customer` / `I sign in as a customer` / `logged in as customer` | one sentence, reused (`npm run steps:list`) |

## 5.3 Test design techniques (what to cover)

| Technique | Use for | Example |
|---|---|---|
| Equivalence partitions | input classes that behave the same | valid email / invalid format / unknown user |
| Boundary values | limits | message length 49 / 50 / 51 characters |
| Decision table | combinations of conditions | payment method × signed-in × country |
| State transition | lifecycles | cart → address → paid → placed; can a placed order be paid again? |
| Error guessing | where apps usually break | empty fields, double submit, back button, very long text, special characters |
| Roles and permissions | who may do what | customer vs admin vs guest |
| End-to-end journey | the money paths | browse → cart → checkout → invoice |

Use `Scenario Outline` for partitions and boundaries:

```gherkin
  Scenario Outline: Message length must be at least 50 characters
    When I send a contact message with <length> characters
    Then the message should be <result>

    Examples:
      | length | result   |
      | 49     | rejected |
      | 50     | accepted |
```

## 5.4 Tags

| Tag | Meaning | Effect |
|---|---|---|
| `@draft` | written, not yet approved | **not generated, not run** |
| `@manual` | will stay manual (reason in a comment) | not generated, not run |
| `@smoke` | few, fast, proves the app is up and the main journey works | `npm run test:smoke`; pull-request CI |
| `@regression` | the full set | `npm run test:regression`; nightly CI |
| `@<area>` | business area (`@cart`, `@account`) | `--grep @cart` |
| `@negative`, `@boundary`, `@e2e`, `@a11y` | kind of test | filtering and reporting |
| `@gap` + `@fixme` | known application bug (link the Gap page in a comment) | shown as "fixme" in reports, not as failed |
| `@skip`, `@only`, `@fail`, `@slow`, `@timeout:<ms>`, `@retries:<n>`, `@mode:serial` | playwright-bdd special tags | use rarely, with a reason |

Run by tag: `npx playwright test --grep "@cart"`, combine: `--grep "@smoke" --grep-invert "@slow"`.

## 5.5 Generic steps (work on any site, no code)

Use visible text: button names, link names, field labels or placeholders. Good for first drafts and simple pages; for real suites prefer domain steps (rule 1).

**Navigation**

```gherkin
Given I am on the home page
Given I open the "/pricing" page                 # path or full URL
When I go back
When I reload the page
Then the page URL should contain "/pricing"
Then the page title should contain "Pricing"
Then the page should load without errors         # visible heading, no 404/500 text
```

**Login** (form described in `.env`: `LOGIN_PATH`, `LOGIN_USERNAME_FIELD`, …; users `<ROLE>_USERNAME`/`<ROLE>_PASSWORD`)

```gherkin
Given I am logged in as a "customer"
Given I am logged in as an "admin"
```

**Actions**

```gherkin
When I click the "Save" button
When I click the "Terms" link
When I click "Settings"                          # button, link, tab, menu item, checkbox or text
When I fill "Email" with "jane@example.com"
When I clear "Search"
When I select "Austria" from "Country"
When I check "I accept the terms"
When I uncheck "Subscribe"
When I press "Enter"
When I fill in the form:
  | First name | Jane       |
  | Country    | Austria    |
```

**Checks**

```gherkin
Then I should see "Order saved"
Then I should not see "Error"
Then I should see the "My account" heading
Then I should see the "Checkout" button
Then I should see the "Forgot password?" link
Then the "Pay" button should be disabled
Then the "Pay" button should be enabled
Then the "Email" field should contain "jane@example.com"
Then I should see an alert "Payment was successful"
Then the page should have no serious accessibility violations
```

Full current list, including your app's steps: `npm run steps:list`.

## 5.6 From draft to automated

1. The scenario designer (or you) writes the feature with `@draft`.
2. Review: the qestack panel and you (see [AI workflow](02-ai-workflow.md)). You approve → `@draft` is removed.
3. `npx bddgen` reports steps without code and prints ready-made snippets; the automator implements them.
4. `npm test` runs it; the report shows each Gherkin step with its result.

## 5.7 Checklist for reviewers

- [ ] Would the product owner agree that, if these pass, the feature works?
- [ ] Each Then has an exact expected value that comes from the knowledge base?
- [ ] Negative, boundary and role cases for each rule?
- [ ] Each scenario independent and about one behaviour?
- [ ] No UI mechanics, no secrets, no test data that does not matter?
