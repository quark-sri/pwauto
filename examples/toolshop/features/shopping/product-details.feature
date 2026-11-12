# Knowledge: knowledge/catalog/screens/product-details.md, knowledge/catalog/rules/stock.md
@toolshop @product
Feature: Product details
  As a shopper
  I want to see the details of a product
  So that I know what I buy and whether I can buy it now

  @smoke @regression
  Scenario: Product details show the name, price and description
    Given I am on the home page
    When I open the product "Combination Pliers"
    Then I should see the product name "Combination Pliers"
    And the product price should be "$14.15"
    And the product should have a description

  @regression @negative
  Scenario: An out-of-stock product cannot be added to the cart
    Given I am on the home page
    When I open the product "Long Nose Pliers"
    Then the product should be marked "Out of stock"
    And I should not be able to add it to the cart
