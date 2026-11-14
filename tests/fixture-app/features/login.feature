# Framework tests: the generic login fixture (login by role, session reuse).
@framework
Feature: Generic login

  Scenario: Login by role opens the protected page
    Given I am logged in as a "customer"
    When I open the "/account" page
    Then I should see the "My account" heading
    And I should see "Welcome, Test User"

  Scenario: A second scenario gets the session again
    Given I am logged in as a "customer"
    When I open the "/account" page
    Then I should see the "Sign out" link

  Scenario: Without login the protected page sends the user to the login page
    Given I open the "/account" page
    Then the page URL should contain "/login"
    And I should see the "Sign in" heading

  Scenario: Wrong credentials show an error
    Given I open the "/login" page
    When I fill "Email" with "tester@example.com"
    And I fill "Password" with "wrong-pass"
    And I click the "Sign in" button
    Then I should see an alert "Invalid email or password"
    And the page URL should contain "/login"

  # Single sign-on and MFA: the role has no password; a person saved the session once.
  Scenario: A role without a password uses its saved session
    Given a person saved a browser session for a new role
    And I am logged in with that saved session
    When I open the "/account" page
    Then I should see the "My account" heading
