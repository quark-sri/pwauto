# Framework tests: generic interaction steps (fields, selects, checkboxes, tables).
@framework
Feature: Generic form steps

  Background:
    Given I open the "/products" page

  Scenario: A field is found by its label and filters the list
    When I fill "Search" with "hammer"
    Then I should see "2 product(s)"
    And the "Search" field should contain "hammer"
    And I should see "Claw hammer"
    And I should not see "Pliers"

  Scenario: A cleared field shows everything again
    When I fill "Search" with "saw"
    Then I should see "1 product(s)"
    When I clear "Search"
    Then I should see "4 product(s)"

  Scenario: No match shows the empty message
    When I fill "Search" with "ladder"
    Then I should see "No products found"

  Scenario: A checkbox is checked and unchecked
    When I check "In stock only"
    Then I should see "3 product(s)"
    And I should not see "Sledge hammer"
    When I uncheck "In stock only"
    Then I should see "4 product(s)"

  Scenario: An option is selected by its visible text
    When I select "Price (low to high)" from "Sort by"
    Then the "Sort by" field should contain "price"

  Scenario: A form is filled from a table and submitted
    Given I open the "/contact" page
    When I fill in the form:
      | Field   | Value            |
      | Name    | Ada              |
      | Subject | Returns          |
      | Message | My saw is blunt. |
    And I click "Send"
    Then I should see an alert "Thanks, Ada. We will answer about: Returns."
