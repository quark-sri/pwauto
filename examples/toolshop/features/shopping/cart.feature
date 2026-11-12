# Knowledge: knowledge/ordering/entities/cart.md, knowledge/ordering/rules/cart-totals.md
@toolshop @cart
Feature: Shopping cart
  As a shopper
  I want to collect products in a cart
  So that I can buy them together and see what I will pay

  @smoke @regression
  Scenario: Adding a product shows a confirmation and updates the cart badge
    Given I am viewing the product "Combination Pliers"
    When I add 2 of it to the cart
    Then I should see the confirmation "Product added to shopping cart."
    And the cart badge should show 2

  @regression
  Scenario: The cart line total is the unit price times the quantity
    Given I have added 3 "Pliers" to the cart
    When I open the cart
    Then the cart should list "Pliers" with quantity 3
    And the line total of "Pliers" should be 3 times its unit price
    And the cart total should equal the sum of the line totals

  @regression
  Scenario: Changing the quantity in the cart updates the totals
    Given I have added 1 "Pliers" to the cart
    And I open the cart
    When I change the quantity of "Pliers" to 4
    Then the line total of "Pliers" should be 4 times its unit price
    And the cart total should equal the sum of the line totals

  @regression
  Scenario: Removing the only product empties the cart
    Given I have added 1 "Pliers" to the cart
    And I open the cart
    When I remove "Pliers" from the cart
    Then the cart should have no products
