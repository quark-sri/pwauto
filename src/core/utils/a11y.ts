/**
 * Accessibility checks with axe-core.
 *
 * Use the "the page should have no serious accessibility violations" step, or
 * set A11Y_CHECKS=true to scan every scenario's last page and attach the
 * result to the report without failing the test.
 */
import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';

export type Impact = 'minor' | 'moderate' | 'serious' | 'critical';
const RANK: Record<Impact, number> = { minor: 1, moderate: 2, serious: 3, critical: 4 };

export interface A11yViolation {
  id: string;
  impact: Impact;
  help: string;
  nodes: number;
  helpUrl: string;
}

export async function scanAccessibility(
  page: Page,
  testInfo: TestInfo,
  options: { minImpact?: Impact; exclude?: string[]; tags?: string[] } = {},
): Promise<A11yViolation[]> {
  const { minImpact = 'serious', exclude = [], tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } = options;
  let builder = new AxeBuilder({ page }).withTags(tags);
  for (const selector of exclude) builder = builder.exclude(selector);
  const results = await builder.analyze();

  await testInfo.attach('accessibility-scan.json', {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });

  return results.violations
    .filter((v) => v.impact && RANK[v.impact as Impact] >= RANK[minImpact])
    .map((v) => ({
      id: v.id,
      impact: v.impact as Impact,
      help: v.help,
      nodes: v.nodes.length,
      helpUrl: v.helpUrl,
    }));
}
