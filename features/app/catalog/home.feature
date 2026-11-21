# Knowledge: knowledge/catalog/screens/home.md
@catalog @draft
Feature: Home page and navigation
  As a visitor
  I want a clear start page and the same navigation on every page
  So that I can find the toys, the contact form and my cart

  @smoke @regression
  Scenario: The home page welcomes the visitor and invites them to shop
    Given I am on the home page
    Then I should see the "Jupiter Toys" heading
    And I should see "toys, games, puzzles, art and craft, novelties, teddy bears, bicycles, kites, models, sports, gifts..."
    And I should see the "Start Shopping »" link

  @regression
  Scenario: Start Shopping leads to the shop
    Given I am on the home page
    When I start shopping
    Then I should see the list of toys for sale

  @regression
  Scenario Outline: The navigation bar is the same on the <page> page
    Given I am on the <page> page with an empty cart
    Then the navigation bar should show the links "Jupiter Toys", "Home", "Shop", "Contact", "Login" and "Cart (0)"

    Examples:
      | page    |
      | home    |
      | shop    |
      | contact |
      | cart    |
