import { test, expect } from '@playwright/test';

const mockConfig = {
  text: 'The quick brown fox jumps over the lazy dog 🚀',
  font: '16px Inter, sans-serif',
  width: 250,
  lineHeight: 24,
};

test.describe('SnapText Browser Smoke Tests', () => {
  test('Tier 1: Identity check - same config returns isStable: true', async ({ page }) => {
    await page.goto('about:blank');
    
    // Load the built module
    const scriptContent = await import('fs').then(fs => fs.readFileSync('./dist/index.mjs', 'utf-8'));
    await page.addScriptTag({ content: scriptContent });
    
    const result = await page.evaluate((cfg) => {
      const { snapshotLayout, verifyLayout } = (window as any).snaptext || (window as any);
      const original = snapshotLayout(cfg);
      return verifyLayout(original);
    }, mockConfig);
    
    expect(result.isStable).toBe(true);
  });

  test('Tier 2: Width sensitivity - 1px change triggers failure', async ({ page }) => {
    await page.goto('about:blank');
    
    const scriptContent = await import('fs').then(fs => fs.readFileSync('./dist/index.mjs', 'utf-8'));
    await page.addScriptTag({ content: scriptContent });
    
    const result = await page.evaluate((cfg) => {
      const { snapshotLayout, verifyLayout } = (window as any).snaptext || (window as any);
      const original = snapshotLayout(cfg);
      const wider = { ...original, width: original.width + 1 };
      return verifyLayout(wider);
    }, mockConfig);
    
    expect(result.isStable).toBe(false);
    expect(result.reason).toContain('width');
  });

  test('Tier 3: Content sensitivity - text change triggers failure', async ({ page }) => {
    await page.goto('about:blank');
    
    const scriptContent = await import('fs').then(fs => fs.readFileSync('./dist/index.mjs', 'utf-8'));
    await page.addScriptTag({ content: scriptContent });
    
    const result = await page.evaluate((cfg) => {
      const { snapshotLayout, verifyLayout } = (window as any).snaptext || (window as any);
      const original = snapshotLayout(cfg);
      const altered = { ...original, text: original.text + '!' };
      return verifyLayout(altered);
    }, mockConfig);
    
    expect(result.isStable).toBe(false);
    expect(result.reason).toContain('text');
  });

  test('Tier 4: Epsilon tolerance - small differences within tolerance pass', async ({ page }) => {
    await page.goto('about:blank');
    
    const scriptContent = await import('fs').then(fs => fs.readFileSync('./dist/index.mjs', 'utf-8'));
    await page.addScriptTag({ content: scriptContent });
    
    const result = await page.evaluate((cfg) => {
      const { snapshotLayout, verifyLayout } = (window as any).snaptext || (window as any);
      const original = snapshotLayout(cfg);
      return verifyLayout(original, 0.05);
    }, mockConfig);
    
    expect(result.isStable).toBe(true);
  });
});
