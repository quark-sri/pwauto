/**
 * Suite settings of the Toolshop worked example.
 *
 * The example has its own URL, test-ID attribute, login form and public demo
 * users, so it runs no matter what you set in .env for YOUR app.
 * Turn it on with INCLUDE_EXAMPLES=true. Remove it with `npm run example:remove`.
 */
export const toolshopSuite = {
  name: 'toolshop',
  features: 'examples/toolshop/features/**/*.feature',
  steps: [
    'src/core/fixtures.ts',
    'src/steps/**/*.ts',
    'examples/toolshop/fixtures.ts',
    'examples/toolshop/steps/**/*.ts',
  ],
  use: {
    baseURL: 'https://practicesoftwaretesting.com',
    testIdAttribute: 'data-test',
    login: {
      path: '/auth/login',
      usernameField: 'Email address',
      passwordField: 'Password',
      submitButton: 'Login',
      success: '/account',
    },
    // Public demo accounts published by practicesoftwaretesting.com.
    defaultUsers: {
      customer: { username: 'customer@practicesoftwaretesting.com', password: 'welcome01' },
    },
  },
};
