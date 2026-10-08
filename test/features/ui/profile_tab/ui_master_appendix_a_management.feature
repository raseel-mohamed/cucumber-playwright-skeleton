Feature: Master Appendix A management
  Authorized user should be able to manage Master appendix A template.

  @CIDC-2372 @CIDC-2748 @Obsolete
  Scenario Outline: Authorized user should be able to Approve or Reject a Master Appendix A file - CIDC-2372
  "Test removed because of CIDC-2748"
    Given I am running the Scenario: "<Dataset>"
    And I navigate to the profile page of "admin"
    And I wait up to 60 seconds till I see trials listed on the profile page
    And I click on the button "Manage Master Templates & Documents" on the page
        Examples:
      | Dataset                                   | action  | version_change |
      | User can approve a master appendix A file | Approve | increased by 1 |
      | User can reject a master appendix A file  | Reject  | unchanged      |
