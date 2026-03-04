import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // baseUrl is the address of your running Vite dev server.
    // Cypress prepends this to every cy.visit('/') call, so you
    // write '/' instead of 'http://localhost:5173/' in your tests.
    baseUrl: 'http://localhost:5173',

    // supportFile: false disables Cypress's default support file
    // (cypress/support/e2e.ts). We don't need it for a simple setup.
    supportFile: false,
  },
});
