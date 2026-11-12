// ESLint: TypeScript + Playwright rules. The rules below are the automatic
// guardrails of docs/04-coding-standards.md. They also stop an AI agent from
// "fixing" a failing test the wrong way (sleeps, skips, focused tests,
// assertion-free steps).
import playwright from 'eslint-plugin-playwright';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules', '.features-gen', 'reports', 'test-results', '.explore', '**/*.mjs'] },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error', // every Playwright call must be awaited
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-empty-pattern': 'off', // Playwright fixtures use ({}, use) => ...
      'no-console': 'error', // use the `log` fixture, it goes into the report
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='waitForTimeout']",
          message: 'No fixed sleeps. Wait for a condition: expect(locator).toBeVisible(), waitForResponse, ...',
        },
        {
          selector: 'CallExpression[callee.property.name=/^(\\$|\\$\\$|\\$eval|\\$\\$eval)$/]',
          message: 'Use page.getByRole/getByLabel/getByTestId locators, not element handles.',
        },
        {
          selector: "CallExpression[callee.property.name='locator'] > Literal[value=/^(\\/\\/|xpath=)/]",
          message: 'No XPath. Use user-facing locators (getByRole, getByLabel, getByText, getByTestId).',
        },
      ],
    },
  },
  {
    files: ['src/**/*.ts', 'examples/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-skipped-test': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/no-networkidle': 'off', // allowed in page objects to settle SPA re-renders
      'playwright/no-standalone-expect': 'off', // step definitions assert outside test()
      'playwright/expect-expect': 'off',
      'playwright/no-conditional-in-test': 'off',
    },
  },
  {
    files: ['scripts/**/*.ts'],
    rules: { 'no-console': 'off' },
  },
);
