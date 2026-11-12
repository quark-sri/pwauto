# This is a starter scenario for YOUR application (BASE_URL in .env).
# It uses only generic steps, so it works for any web site.
# The scenario-designer agent writes real scenarios next to this file,
# one folder per business area: features/app/<area>/<feature>.feature

@smoke
Feature: Application is reachable

  Scenario: The home page loads without errors
    Given I am on the home page
    Then the page should load without errors
