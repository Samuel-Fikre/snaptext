# SnapText

Stable text layout snapshots for `@chenglou/pretext`.

## Installation

```bash
pnpm add snaptext
```

## Usage

```typescript
import { snapshotLayout, verifyLayout } from 'snaptext';

const config = {
  text: 'The quick brown fox jumps over the lazy dog 🚀',
  font: '16px Inter, sans-serif',
  width: 250,
  lineHeight: 24,
};

// Capture how text actually renders
const snapshot = snapshotLayout(config);

// Later, verify layout stability
const result = verifyLayout(snapshot);

if (!result.isStable) {
  console.log('Layout drift detected:', result.reason);
}
```

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

Creates a snapshot of rendered text layout.

### `verifyLayout(snapshot: LayoutSnapshot, tolerance = 0.02): VerifyResult` 

Checks if current layout matches the snapshot within a tolerance.

* Returns `{ isStable: true }` if layout matches
* Returns `{ isStable: false, reason }` if drift is detected

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

## Limitations

* Depends on font availability in the runtime environment
* Layout can change if fonts differ between environments
* Reason messages are best-effort and may vary slightly

## License

MIT
