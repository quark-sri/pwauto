# Knowledge: knowledge/catalog/screens/product-catalog.md, knowledge/catalog/rules/search.md
@toolshop @catalog
Feature: Browse and search the product catalog
  As a shopper
  I want to find tools by name, category and price
  So that I can quickly choose what to buy

  Background:
    Given I am on the home page

  @smoke @regression
  Scenario Outline: Search returns only products that match the keyword
    When I search for "<keyword>"
    Then I should see the search caption "Searched for: <keyword>"
    And every product name should contain "<keyword>"

    Examples:
      | keyword |
      | pliers  |
      | hammer  |

  @regression @negative
  Scenario: Search with no matching product shows an empty result
    When I search for "zzz-no-such-tool"
    Then I should see the no-results message "There are no products found."

  @regression
  Scenario: Sort products by price from low to high
    When I sort the products by "Price (Low - High)"
    Then the product prices should be in ascending order

  @regression
  Scenario: Sort products by name from A to Z
    When I sort the products by "Name (A - Z)"
    Then the product names should be in alphabetical order

  @regression
  Scenario: Filter products by a category
    When I filter by the category "Hammer"
    Then every product name should contain "hammer"

  @regression
  Scenario: Open a category from the navigation menu
    When I open the "Hand Tools" category from the menu
    Then I should see the category title "Category: Hand Tools"
