# Knowledge: knowledge/account/journeys/sign-in.md, knowledge/account/rules/login-validation.md
@toolshop @account
Feature: Customer sign in
  As a registered customer
  I want to sign in to my account
  So that I can manage my profile and check out faster

  @smoke @regression
  Scenario: A registered customer signs in with valid credentials
    Given I am on the login page
    When I sign in as the "customer" user
    Then I should be on my account page
    And the navigation menu should show my name "Jane Doe"

  @regression @negative
  Scenario: Sign in fails for an unknown email address
    Given I am on the login page
    When I sign in with email "nobody@example.com" and password "Wrong-pass-123"
    Then I should see the login error "Invalid email or password"
    And I should still be on the login page

  @regression @negative
  Scenario: Email and password are required
    Given I am on the login page
    When I submit the login form without any details
    Then I should see the field error "Email is required"
    And I should see the field error "Password is required"

  @regression
  Scenario: A signed-in customer signs out
    Given I am logged in as a "customer"
    And I am on the home page
    When I sign out
    Then I should see the "Sign in" link
