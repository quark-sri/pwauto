# Knowledge: knowledge/support/screens/contact.md, knowledge/support/rules/contact-validation.md
@toolshop @contact
Feature: Contact the shop
  As a visitor
  I want to send a message to the shop
  So that I can get help with my order or a product

  Background:
    Given I am on the contact page

  @smoke @regression
  Scenario: A visitor sends a valid message
    When I send a contact message about "Warranty" with a valid text
    Then I should see the contact confirmation

  @regression @negative
  Scenario: Subject and message are required
    When I send the contact form with my name and email only
    Then I should see the field error "Subject is required"
    And I should see the field error "Message is required"

  @regression @negative @boundary
  Scenario: A message shorter than 50 characters is rejected
    When I send a contact message about "Return" with the text "Too short"
    Then I should see the field error "Message must be minimal 50 characters"

  # Draft (2026-11-15): written by an AI agent, not yet approved by a person.
  # Not automated: approve in pwauto-review, remove @draft, then pwauto-automate writes the steps. Rule: knowledge/support/rules/contact-validation.md
  @regression @negative @boundary @draft
  Scenario: A message of 49 characters is rejected
    When I send a contact message about "Return" with a text of 49 characters
    Then I should see the field error "Message must be minimal 50 characters"

  @regression @boundary @draft
  Scenario: A message of 50 characters is accepted
    When I send a contact message about "Return" with a text of 50 characters
    Then I should see the contact confirmation
