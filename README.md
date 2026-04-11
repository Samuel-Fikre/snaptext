# SnapText

Snapshot and compare text layout for `@chenglou/pretext` output.

## Mental Model

- **Snapshot** = frozen layout output of text rendering
- **Verify** = recompute + compare
- **Failure** = layout changed between builds/environments

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
  console.log('Layout drift detected:', result.type, result.reason);
}
```

**Advanced: Manual font control**

If you need fine-grained control over font loading:

```typescript
import { waitForFonts, snapshotLayout } from 'snaptext';

await waitForFonts();
const snapshot = snapshotLayout(config);
```

## Why SnapText?

Text layout can drift across environments.

Small differences in browsers, OS font rendering, and font versions can cause subtle UI shifts (line breaks, wrapping, height).

SnapText captures and compares rendered layout output to detect:

* unexpected line wrapping changes
* layout drift across environments
* rendering inconsistencies in CI

**Note:** SnapText turns Pretext's layout output into a testable snapshot diff system.

## What It Actually Checks

SnapText compares **rendered layout structure**, including:

* line count
* line text (per line)
* line widths
* total height

It does **not** validate raw config changes directly.
A change only fails if it **affects the rendered layout**.

## API

### `snapshotLayoutAsync(config: LayoutConfig): Promise<LayoutSnapshot>`

Async API for browser environments. Waits for fonts to be ready before capturing layout.
Normalizes text to NFC to ensure consistent Unicode representation.

### `verifyLayout(reference: LayoutSnapshot, current: LayoutSnapshot, tolerance = 0.02): VerifyResult`

Compares two snapshots (reference vs current) within a tolerance.

Returns a discriminated union — use `result.type` for programmatic handling:

```typescript
// Stable
{ isStable: true }

// Unstable — use `type` for programmatic handling
{
  isStable: false,
  reason: 'text mismatch at line 0: "hello" vs "hello!"',  // human-readable
  type: 'text',              // programmatic contract: "text" | "width" | "height" | "lineCount"
  expected: 'hello',
  actual: 'hello!',
  line: 0,                   // only present for per-line errors
}
```

**Note:** `reason` is human-readable only. Use `type` for programmatic error handling.

## Tolerance (Epsilon)

Layout measurements can differ slightly across environments.

SnapText uses a tolerance (default `0.02`) for numeric layout metrics (width/height):

* ≤ tolerance → considered stable
* > tolerance → considered drift

This prevents false positives from sub-pixel rendering differences.

## Testing

```bash
pnpm install
pnpm build
pnpm exec playwright install chromium
pnpm test
```

See [Playwright docs](https://playwright.dev) for advanced options.

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
* Snapshots may break if the underlying layout engine (Pretext) version changes
* Reason messages are best-effort and may vary slightly

## License

MIT
