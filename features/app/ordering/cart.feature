# Knowledge: knowledge/ordering/rules/cart-totals.md, knowledge/ordering/rules/cart-quantity.md,
#            knowledge/ordering/screens/cart.md, knowledge/ordering/entities/cart.md
# Each scenario builds its own cart in a fresh browser session.
# The total is shown without "$" ("Total: 34.97"); expected by tester decision
# (2026-11-22). Issue drafted for the site owner: BUG-002.
@ordering @draft
Feature: Cart quantities, subtotals and total
  As a visitor
  I want to see and change what is in my cart
  So that I know exactly what I will pay before I check out

  @regression
  Scenario Outline: The subtotal of a row is the unit price times the quantity
    Given I have added <quantity> "<toy>" to the cart
    When I open the cart
    Then the cart row "<toy>" should show price "<price>", quantity <quantity> and subtotal "<subtotal>"

    # 2 and 5 Stuffed Frog and 1 Teddy Bear were observed; 3 Valentine Bear is derived from the same rule.
    Examples:
      | toy            | price  | quantity | subtotal |
      | Teddy Bear     | $12.99 | 1        | $12.99   |
      | Stuffed Frog   | $10.99 | 2        | $21.98   |
      | Stuffed Frog   | $10.99 | 5        | $54.95   |
      | Valentine Bear | $14.99 | 3        | $44.97   |

  @smoke @regression
  Scenario: The cart total is the sum of the subtotals
    Given I have added these toys to the cart:
      | toy          | quantity |
      | Stuffed Frog | 2        |
      | Teddy Bear   | 1        |
    When I open the cart
    Then the cart total should read "Total: 34.97"

  @regression
  Scenario: The cart tells how many items it holds
    Given I have added these toys to the cart:
      | toy          | quantity |
      | Stuffed Frog | 2        |
      | Teddy Bear   | 1        |
    When I open the cart
    Then I should see "There are 3 items in your cart, you can Checkout or carry on Shopping."

  @regression
  Scenario: Changing a quantity updates the subtotal, the total and the item count
    Given I have added these toys to the cart:
      | toy          | quantity |
      | Stuffed Frog | 2        |
      | Teddy Bear   | 1        |
    When I change the quantity of "Stuffed Frog" to 5
    Then the cart row "Stuffed Frog" should show subtotal "$54.95"
    And the cart total should read "Total: 67.94"
    And I should see "There are 6 items in your cart, you can Checkout or carry on Shopping."
    And the cart link should show "Cart (6)"

  @regression @negative
  Scenario: The quantity field does not accept letters
    Given I have added 2 "Stuffed Frog" to the cart
    When I try to type "abc" as the quantity of "Stuffed Frog"
    Then the quantity of "Stuffed Frog" should still be 2

  # Current behaviour, expected by tester decision (2026-11-22). Issue drafted for the site owner: BUG-003.
  # Knowledge: knowledge/ordering/rules/cart-quantity.md
  @regression @negative @boundary
  Scenario Outline: A quantity of <quantity> is ignored and the totals keep the last valid values
    Given I have added 2 "Stuffed Frog" to the cart
    When I change the quantity of "Stuffed Frog" to <quantity>
    Then the cart row "Stuffed Frog" should show subtotal "$21.98"
    And the cart total should read "Total: 21.98"
    And the cart link should show "Cart (2)"

    Examples:
      | quantity |
      | 0        |
      | -1       |

  @regression
  Scenario: Removing a toy asks for confirmation first
    Given I have added 1 "Stuffed Frog" to the cart
    When I ask to remove "Stuffed Frog" from the cart
    Then I should see the dialog "Remove Item" asking "Are you sure that you want to remove Stuffed Frog from your cart?"

  @regression
  Scenario: Answering No to the removal keeps the toy in the cart
    Given I have added 1 "Stuffed Frog" to the cart
    When I ask to remove "Stuffed Frog" from the cart and answer "No"
    Then the cart row "Stuffed Frog" should show quantity 1 and subtotal "$10.99"

  @regression
  Scenario: Emptying the cart asks for confirmation first
    Given I have added 1 "Teddy Bear" to the cart
    When I ask to empty the cart
    Then I should see the dialog "Empty Cart" asking "Are you sure that you want to empty your cart?"

  @regression
  Scenario: Confirming Empty Cart removes all toys
    Given I have added these toys to the cart:
      | toy          | quantity |
      | Stuffed Frog | 2        |
      | Teddy Bear   | 1        |
    When I ask to empty the cart and answer "Yes"
    Then I should see "Your cart is empty - there's nothing to see here."
    And the cart link should show "Cart (0)"

  @regression
  Scenario: An empty cart invites the visitor to start shopping
    Given my cart is empty
    When I open the cart
    Then I should see "Your cart is empty - there's nothing to see here."
    And I should see the "Start Shopping »" link
