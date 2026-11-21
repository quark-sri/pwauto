# Knowledge: knowledge/account/rules/login-validation.md, knowledge/account/screens/login-dialog.md,
#            knowledge/account/journeys/try-login.md
# No test user is known (user decision): only what a visitor sees without a successful login.
# The unknown user is made up; no real account is used, so no account can be locked.
@account @draft
Feature: Login dialog
  As a visitor
  I want clear feedback when my login details are wrong
  So that I know I am not logged in

  @regression
  Scenario: The login dialog asks for username and password
    Given I am on the home page
    When I open the login dialog
    Then I should see the login dialog with the fields "Username" and "Password"

  @smoke @regression @negative
  Scenario: Wrong login details are refused
    Given I am on the home page
    When I log in as an unknown user
    Then I should see the login error "Your login details are incorrect"
    And the login dialog should still be open
    And the navigation bar should still offer "Login"

  @regression @negative
  Scenario: Empty login details are refused with the same message
    Given I am on the home page
    When I submit the login dialog without any details
    Then I should see the login error "Your login details are incorrect"

  @regression
  Scenario: Cancel closes the login dialog
    Given I am on the home page
    And I have opened the login dialog
    When I cancel the login
    Then the login dialog should be closed
