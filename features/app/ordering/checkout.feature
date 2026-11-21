# Knowledge: knowledge/ordering/journeys/checkout.md, knowledge/ordering/screens/checkout.md,
#            knowledge/ordering/rules/checkout-validation.md, knowledge/ordering/entities/order.md
# Test environment: orders are placed with fake data (user decision). Each scenario
# builds its own cart in a fresh browser session.
# The confirmation is checked without the words "Your order nuumber is": the spelling is
# an open question for the tester (knowledge/questions.md "Typo nuumber").
@ordering @draft
Feature: Checkout as a visitor
  As a visitor
  I want to give my delivery and payment details for the toys in my cart
  So that my order is accepted and I get an order number

  @smoke @regression @e2e
  Scenario: A visitor buys a toy in the shop and places the order
    Given I am on the shop page with an empty cart
    When I buy 1 "Teddy Bear"
    And I check out with valid delivery and payment details for "Ada"
    Then I should see "Thanks Ada, your order has been accepted."
    And I should see an order number made of "JT" followed by 13 digits

  @regression
  Scenario Outline: An order is accepted when paying by <card type>
    Given I have added 1 "Smiley Face" to the cart
    When I check out as "Ada" with valid delivery details and card type "<card type>"
    Then I should see "Thanks Ada, your order has been accepted."

    Examples:
      | card type  |
      | Visa       |
      | Mastercard |

  @regression
  Scenario: Placing an order empties the cart
    Given I have added 2 "Funny Cow" to the cart
    When I check out with valid delivery and payment details for "Ada"
    Then the cart link should show "Cart (0)"

  @regression
  Scenario: Surname and telephone are optional
    Given I have added 1 "Handmade Doll" to the cart
    When I check out as "Ada" with valid details but without surname and telephone
    Then I should see "Thanks Ada, your order has been accepted."

  @regression
  Scenario: The checkout page tells how many items are on their way
    Given I have added 1 "Teddy Bear" to the cart
    When I go to the checkout
    Then I should see "Almost there - your 1 item is nearly in your hands."

  @regression @negative
  Scenario: Submitting an empty checkout form shows what is missing
    Given I have added 1 "Teddy Bear" to the cart
    When I submit the checkout form without any details
    Then I should see "Almost there - but we can't send your items unless you complete the form correctly."
    And I should see the field errors:
      | Forename is required    |
      | Email is required       |
      | Address is required     |
      | Credit Card is required |

  @regression @negative
  Scenario Outline: The order is not placed without <field>
    Given I have added 1 "Teddy Bear" to the cart
    When I submit the checkout form with valid details except an empty <field>
    Then I should see the field error "<message>"
    And the order should not be placed

    Examples:
      | field       | message                 |
      | Forename    | Forename is required    |
      | Email       | Email is required       |
      | Address     | Address is required     |
      | Card Number | Credit Card is required |

  # Expected result needs a tester decision: Must the visitor choose a Card Type? The field
  # is labelled "Card Type*" (required), but an order with a blank Card Type was accepted.
  # Knowledge: knowledge/ordering/rules/checkout-validation.md, knowledge/questions.md
  @regression @negative @needs-decision
  Scenario: Checkout with no card type chosen
    Given I have added 1 "Teddy Bear" to the cart
    When I submit the checkout form with valid details but no card type
    Then the expected result is still to be decided by the tester

  # Expected result needs a tester decision: Which card number formats are valid, and which
  # message should a visitor see for a card number such as "abcd"? Today no format message
  # is shown (only "Credit Card is required" when the field is empty).
  # Knowledge: knowledge/ordering/rules/checkout-validation.md, knowledge/questions.md
  @regression @negative @needs-decision
  Scenario: Checkout with a card number that contains letters
    Given I have added 1 "Teddy Bear" to the cart
    When I submit the checkout form with valid details and card number "abcd"
    Then the expected result is still to be decided by the tester

  # Expected result needs a tester decision: What should the checkout page show when it is
  # opened again right after an order, with an empty cart? Today it shows the previous
  # confirmation with the same order number again.
  # Knowledge: knowledge/ordering/rules/checkout-validation.md, knowledge/questions.md
  @regression @needs-decision
  Scenario: Opening the checkout again right after an order
    Given I have just placed an order
    When I go to the checkout
    Then the expected result is still to be decided by the tester
