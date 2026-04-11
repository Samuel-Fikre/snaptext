# SnapText

Stable text layout snapshots for `@chenglou/pretext`.

## Installation

```bash
pnpm add snaptext
```

## Usage

```typescript
import { snapshotLayoutAsync, verifyLayout } from 'snaptext';

const config = {
  text: 'The quick brown fox jumps over the lazy dog 🚀',
  font: '16px Inter, sans-serif',
  width: 250,
  lineHeight: 24,
};

// Capture reference snapshot (waits for fonts to load in browser)
const reference = await snapshotLayoutAsync(config);

// Later, capture current state
const current = await snapshotLayoutAsync(config);

// Compare them
const result = verifyLayout(reference, current);

if (!result.isStable) {
  console.log('Layout drift detected:', result.reason);
}
```

**Note:** `snapshotLayout` is the pure synchronous core. Use `snapshotLayoutAsync` in browser environments to ensure fonts are loaded before measuring.

## Why SnapText?

Text layout is not fully deterministic across environments.

Small differences in:

* browsers (Chrome vs Safari)
* OS font rendering
* font versions

can cause subtle UI shifts (line breaks, wrapping, height).

SnapText captures **rendered layout output**, not just inputs, and verifies it later.

This lets you detect:

* unexpected line wrapping changes
* layout drift across environments
* rendering inconsistencies in CI

## What It Actually Checks

SnapText compares **rendered layout structure**, including:

* line count
* line text (per line)
* line widths
* total height

It does **not** validate raw config changes directly.
A change only fails if it **affects the rendered layout**.

## API

### `snapshotLayout(config: LayoutConfig): LayoutSnapshot` 

Pure synchronous core. Creates a snapshot of rendered text layout without waiting for fonts.
Normalizes text to NFC to ensure consistent Unicode representation.

### `snapshotLayoutAsync(config: LayoutConfig): Promise<LayoutSnapshot>` 

Async wrapper for browser environments. Waits for fonts to be ready before calling `snapshotLayout`.
Use this in browsers to ensure accurate measurements.

### `verifyLayout(reference: LayoutSnapshot, current: LayoutSnapshot, tolerance = 0.02): VerifyResult` 

Compares two snapshots (reference vs current) within a tolerance.

Returns a discriminated union — no string parsing needed:

```typescript
// Stable
{ isStable: true }

// Unstable — machine-readable metadata included
{
  isStable: false,
  reason: 'text mismatch at line 0: "hello" vs "hello!"',
  type: 'text',              // "text" | "width" | "height" | "lineCount"
  expected: 'hello',         // string | number
  actual: 'hello!',          // string | number
  line: 0,                   // only present for per-line errors
}
```

Use `result.type` to programmatically handle different failure modes without parsing `reason`.

## Tolerance (Epsilon)

Layout measurements can differ slightly across environments.

SnapText uses a tolerance (default `0.02`) to allow small differences:

* ≤ tolerance → considered stable
* > tolerance → considered drift

This prevents false positives from sub-pixel rendering differences.

## Testing

SnapText uses Playwright to run tests in a real browser environment.

This avoids issues with missing Canvas/DOM APIs in Node.

### Local Testing

```bash
pnpm install
pnpm build
pnpm exec playwright install chromium
pnpm test
```

### Interactive Debugging

```bash
pnpm test:ui
```

### Windows

Works natively. No WSL required.

```powershell
pnpm install
pnpm build
pnpm exec playwright install chromium
pnpm test
```

## Test Coverage

Smoke tests verify:

1. **Identity**
   Same snapshot → stable

2. **Layout Sensitivity**
   Significant width changes that alter wrapping → detected

3. **Content Sensitivity**
   Text changes → detected with reason

4. **Epsilon Tolerance**
   Small cross-environment drift → allowed

5. **Snapshot Corruption**
   Modified snapshot lines → detected

6. **Unicode Normalization**
   NFC and NFD forms of same text → treated as identical

## Limitations

* Depends on font availability in the runtime environment
* Layout can change if fonts differ between environments
* Reason messages are best-effort and may vary slightly

## License

MIT
