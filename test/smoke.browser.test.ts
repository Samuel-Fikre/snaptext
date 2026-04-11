import { test, expect } from '@playwright/test';
import path from 'path';

const mockConfig = {
  text: 'The quick brown fox jumps over the lazy dog 🚀',
  font: '16px Arial, sans-serif', // deterministic font
  width: 250,
  lineHeight: 24,
};

test.describe('SnapText Browser Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setContent('<div id="root"></div>');

    const bundlePath = path.resolve(process.cwd(), 'dist/index.iife.js');
    await page.addScriptTag({ path: bundlePath });

    await page.waitForFunction(() => (window as any).snaptext !== undefined);
  });

  test('Tier 1: Identity check - same config returns isStable: true', async ({ page }) => {
    const result = await page.evaluate(async (cfg) => {
      const { snapshotLayoutAsync, verifyLayout } = (window as any).snaptext;
      const original = await snapshotLayoutAsync(cfg);
      const current = await snapshotLayoutAsync(cfg);
      return verifyLayout(original, current);
    }, mockConfig);

    expect(result.isStable).toBe(true);
  });

  test('Tier 2: Width sensitivity - layout change triggers failure', async ({ page }) => {
    const result = await page.evaluate(async (cfg) => {
      const { snapshotLayoutAsync, verifyLayout } = (window as any).snaptext;
      const original = await snapshotLayoutAsync(cfg);

      // force layout change (guaranteed smaller width)
      const narrower = { ...original, width: 100 };
      const current = await snapshotLayoutAsync(narrower);

      return verifyLayout(original, current);
    }, mockConfig);

    expect(result.isStable).toBe(false);
    expect(result.reason).toBeDefined();
  });

  test('Tier 3: Content sensitivity - text change triggers failure', async ({ page }) => {
    const result = await page.evaluate(async (cfg) => {
      const { snapshotLayoutAsync, verifyLayout } = (window as any).snaptext;
      const original = await snapshotLayoutAsync(cfg);

      // isolate text mutation only
      const altered = { ...original, text: original.text + '!' };
      const current = await snapshotLayoutAsync(altered);

      return verifyLayout(original, current);
    }, mockConfig);

    expect(result.isStable).toBe(false);
    expect(result.reason).toContain('text');
  });

  test('Tier 4: Epsilon tolerance - small drift within tolerance passes', async ({ page }) => {
    const result = await page.evaluate(async (cfg) => {
      const { snapshotLayoutAsync, verifyLayout } = (window as any).snaptext;
      const original = await snapshotLayoutAsync(cfg);

      // simulate tiny cross-env drift
      const drifted = { ...original, height: original.height + 0.01 };

      return verifyLayout(original, drifted, 0.05);
    }, mockConfig);

    expect(result.isStable).toBe(true);
  });

  test('Tier 4b: Epsilon boundary - large drift beyond tolerance fails', async ({ page }) => {
    const result = await page.evaluate(async (cfg) => {
      const { snapshotLayoutAsync, verifyLayout } = (window as any).snaptext;
      const original = await snapshotLayoutAsync(cfg);

      // simulate larger drift
      const drifted = { ...original, height: original.height + 0.1 };

      return verifyLayout(original, drifted, 0.05);
    }, mockConfig);

    expect(result.isStable).toBe(false);
  });

  test('Tier 5: Snapshot corruption - modifying snapshot breaks verification', async ({ page }) => {
    const result = await page.evaluate(async (cfg) => {
      const { snapshotLayoutAsync, verifyLayout } = (window as any).snaptext;
      const original = await snapshotLayoutAsync(cfg);

      // simulate corrupted stored snapshot
      const corrupted = {
        ...original,
        lines: original.lines.map((l: { text: string }, i: number) =>
          i === 0 ? { ...l, text: l.text + 'X' } : l
        ),
      };

      return verifyLayout(corrupted, original);
    }, mockConfig);

    expect(result.isStable).toBe(false);
  });
});

test.describe('SnapText Determinism - Unicode Normalization', () => {
  test.beforeEach(async ({ page }) => {
    await page.setContent('<div id="root"></div>');
    const bundlePath = path.resolve(process.cwd(), 'dist/index.iife.js');
    await page.addScriptTag({ path: bundlePath });
    await page.waitForFunction(() => (window as any).snaptext !== undefined);
  });

  test('Tier 6: Unicode Normalization - NFC and NFD produce identical layout', async ({ page }) => {
    const result = await page.evaluate(() => {
      const { snapshotLayout, verifyLayout } = (window as any).snaptext;

      // "é" in Decomposed form (2 characters in memory)
      const textNFD = "\u0065\u0301"; 
      // "é" in Composed form (1 character in memory)
      const textNFC = "\u00E9"; 

      const configNFD = {
        text: textNFD,
        font: '16px Arial', // System font, assumed available
        width: 100,
        lineHeight: 20
      };

      const configNFC = {
        text: textNFC,
        font: '16px Arial',
        width: 100,
        lineHeight: 20
      };

      // Test core normalization logic directly (sync)
      const snapshot = snapshotLayout(configNFD);
      const current = snapshotLayout(configNFC);
      
      return {
        verifyResult: verifyLayout(snapshot, current),
        originalTextLength: textNFD.length,
        normalizedTextLength: snapshot.text.length
      };
    });

    // Layout should be identical after normalization
    expect(result.verifyResult.isStable).toBe(true);
    // Verify normalization actually happened (2 chars → 1 char)
    expect(result.originalTextLength).toBe(2);
    expect(result.normalizedTextLength).toBe(1);
  });
});