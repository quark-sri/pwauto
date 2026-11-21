# Knowledge: knowledge/support/rules/contact-validation.md, knowledge/support/screens/contact.md,
#            knowledge/support/journeys/send-feedback.md
# Test environment: contact messages may be sent with fake data (user decision).
# Field length limits are unknown (knowledge/questions.md), so no length boundaries here.
@support @draft
Feature: Contact form
  As a visitor
  I want to send feedback to the shop
  So that the shop hears what I think

  Background:
    Given I am on the contact page

  @smoke @regression
  Scenario: A visitor sends feedback with only the required fields
    When I send feedback as "Ada" with a valid email and a message
    Then I should see "Thanks Ada, we appreciate your feedback."

  @regression
  Scenario: A visitor sends feedback with every field filled in
    When I send feedback with all fields filled in, forename "Ada" and telephone "+61 2 1234 5678"
    Then I should see "Thanks Ada, we appreciate your feedback."

  @regression @negative
  Scenario: Submitting an empty contact form shows what is missing
    When I submit the contact form without any details
    Then I should see "We welcome your feedback - but we won't get it unless you complete the form correctly."
    And I should see the field errors:
      | Forename is required |
      | Email is required    |
      | Message is required  |

  @regression @negative
  Scenario Outline: Feedback is not sent without a <field>
    When I submit the contact form with valid details except an empty <field>
    Then I should see the field error "<message>"
    And the feedback should not be sent

    Examples:
      | field    | message              |
      | Forename | Forename is required |
      | Email    | Email is required    |
      | Message  | Message is required  |

  @regression @negative
  Scenario: An email address without the right format is rejected
    When I enter "bad" as my email
    Then I should see the field error "Please enter a valid email"

  @regression @negative
  Scenario: A telephone number with letters is rejected
    When I enter "abc" as my telephone number
    Then I should see the field error "Please enter a valid telephone number"

  @regression
  Scenario: A field error disappears when the value is corrected
    Given I have entered "bad" as my email
    When I correct my email to a valid address
    Then I should not see "Please enter a valid email"
