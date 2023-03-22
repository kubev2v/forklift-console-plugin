describe("Providers screen", () => {
  it("opens create dialog", () => {
    cy.visit("/");
    cy.contains(".pf-c-nav__link", "Migration").click();
    cy.contains(".pf-c-nav__link", "Providers for virtualization").click();
    cy.contains('button[type="button"]', "Create Provider").click();
  });
});
