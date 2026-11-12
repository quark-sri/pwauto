# Each scenario registers its own customer through the API, so parallel
# runs never share a cart or a session.
# Knowledge: knowledge/ordering/journeys/checkout.md, knowledge/ordering/entities/order.md
@toolshop @checkout
Feature: Checkout
  As a signed-in customer
  I want to pay for the products in my cart
  So that my order is placed and I get an invoice

  @smoke @regression
  Scenario: A signed-in customer skips the sign-in step of checkout
    Given I am a newly registered customer
    And I have added 1 "Pliers" to the cart
    When I open the cart
    And I proceed to checkout
    Then I should be told that I am already signed in

  # Known application bug: a valid billing address is randomly rejected (422).
  # See examples/toolshop/bugs/BUG-001-valid-billing-address-rejected.md.
  # The assertions stay; remove @fixme to run the scenarios again.
  @regression @e2e @known-bug @fixme
  Scenario Outline: A signed-in customer places an order paying by <payment method>
    Given I am a newly registered customer
    And I have added 1 "Pliers" to the cart
    When I check out with a new billing address
    And I pay by "<payment method>"
    Then I should see the payment message "Payment was successful"
    When I confirm the order
    Then I should see an order confirmation with an invoice number

    Examples:
      | payment method   |
      | Cash on Delivery |
      | Bank Transfer    |
