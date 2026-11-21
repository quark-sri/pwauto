# Knowledge: knowledge/catalog/screens/shop.md, knowledge/catalog/entities/product.md,
#            knowledge/catalog/rules/add-to-cart.md, knowledge/catalog/journeys/buy-toys.md
# Each scenario starts with its own empty cart (a fresh browser session).
@catalog @draft
Feature: Shop
  As a visitor
  I want to see the toys with their prices and put them in my cart
  So that I can buy the toys I like

  @regression
  Scenario: The shop lists every toy with its price
    Given I am on the shop page
    Then the shop should list these toys with their prices:
      | toy            | price  |
      | Teddy Bear     | $12.99 |
      | Stuffed Frog   | $10.99 |
      | Handmade Doll  | $10.99 |
      | Fluffy Bunny   | $9.99  |
      | Smiley Bear    | $14.99 |
      | Funny Cow      | $10.99 |
      | Valentine Bear | $14.99 |
      | Smiley Face    | $9.99  |

  @smoke @regression
  Scenario: Buying a toy adds one unit to the cart
    Given I am on the shop page with an empty cart
    When I buy 1 "Teddy Bear"
    Then the cart link should show "Cart (1)"

  @regression
  Scenario: Buying the same toy twice gives one cart row with quantity 2
    Given I am on the shop page with an empty cart
    When I buy 2 "Stuffed Frog"
    Then my cart should have 1 row
    And the cart row "Stuffed Frog" should show quantity 2 and subtotal "$21.98"

  @regression
  Scenario: The cart link counts units, not different toys
    Given I am on the shop page with an empty cart
    When I buy 2 "Stuffed Frog" and 1 "Teddy Bear"
    Then the cart link should show "Cart (3)"

  @regression
  Scenario Outline: The cart is kept when the visitor moves to the <page> page
    Given I have added 2 "Fluffy Bunny" to the cart
    When I go to the <page> page
    Then the cart link should show "Cart (2)"

    Examples:
      | page    |
      | home    |
      | contact |
      | shop    |
