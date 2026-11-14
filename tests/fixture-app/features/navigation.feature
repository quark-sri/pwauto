# Framework tests: generic navigation and assertion steps against the fixture site.
@framework
Feature: Generic navigation steps

  Scenario: The home page loads
    Given I am on the home page
    Then the page should load without errors
    And I should see the "Fixture shop" heading
    And the page title should contain "Home"

  Scenario: A link opens another page and "back" returns
    Given I am on the home page
    When I click the "Products" link
    Then the page URL should contain "/products"
    And I should see the "Products" heading
    When I go back
    Then I should see the "Fixture shop" heading

  Scenario: A page is opened by its path
    Given I open the "contact" page
    Then I should see the "Contact" heading
    And I should see the "Send" button
    And I should see the "Sign in" link

  Scenario: Text that appears late is waited for
    Given I am on the home page
    Then I should see the "Fixture shop" heading
    And I should not see "Hello, tester!"
    When I click the "Say hello" button
    Then I should see "Hello, tester!"

  Scenario: Button states
    Given I am on the home page
    Then the "Checkout" button should be disabled
    And the "Say hello" button should be enabled

  Scenario: The page is still there after a reload
    Given I open the "/products" page
    When I reload the page
    Then I should see "4 product(s)"
