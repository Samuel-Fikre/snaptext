import { test, expect } from '@playwright/test';
import path from 'path';

const mockConfig = {
  text: 'The quick brown fox jumps over the lazy dog 🚀',
  font: '16px Inter, sans-serif',
  width: 250,
  lineHeight: 24,
};

test.describe('SnapText Browser Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Add error logging for debugging
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', err => console.log('ERROR:', err.message));
    
    // Set up minimal HTML page
    await page.setContent('<div id="root"></div>');
    
    // Load browser-ready SnapText IIFE bundle using absolute path
    const bundlePath = path.resolve(process.cwd(), 'dist/index.iife.js');
    await page.addScriptTag({ path: bundlePath });
    
    // Wait until snaptext is available on window
    await page.waitForFunction(() => (window as any).snaptext !== undefined);
  });

  test('Tier 1: Identity check - same config returns isStable: true', async ({ page }) => {
    const result = await page.evaluate((cfg) => {
      const { snapshotLayout, verifyLayout } = (window as any).snaptext;
      const original = snapshotLayout(cfg);
      return verifyLayout(original);
    }, mockConfig);
    
    expect(result.isStable).toBe(true);
  });

  test('Tier 2: Width sensitivity - 1px change triggers failure', async ({ page }) => {
    const result = await page.evaluate((cfg) => {
      const { snapshotLayout, verifyLayout } = (window as any).snaptext;
      const original = snapshotLayout(cfg);
      const wider = { ...original, width: original.width + 1 };
      return verifyLayout(wider);
    }, mockConfig);
    
    expect(result.isStable).toBe(false);
    expect(result.reason).toContain('width');
  });

  test('Tier 3: Content sensitivity - text change triggers failure', async ({ page }) => {
    const result = await page.evaluate((cfg) => {
      const { snapshotLayout, verifyLayout } = (window as any).snaptext;
      const original = snapshotLayout(cfg);
      const altered = { ...original, text: original.text + '!' };
      return verifyLayout(altered);
    }, mockConfig);
    
    expect(result.isStable).toBe(false);
    expect(result.reason).toContain('text');
  });

  test('Tier 4: Epsilon tolerance - small differences within tolerance pass', async ({ page }) => {
    const result = await page.evaluate((cfg) => {
      const { snapshotLayout, verifyLayout } = (window as any).snaptext;
      const original = snapshotLayout(cfg);
      return verifyLayout(original, 0.05);
    }, mockConfig);
    
    expect(result.isStable).toBe(true);
  });
});
