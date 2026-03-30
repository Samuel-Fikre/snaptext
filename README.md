# SnapText

Deterministic text layout snapshots for [@chenglou/pretext](https://github.com/chenglou/pretext).

## Installation

```bash
pnpm add snaptext
```

## Usage

```typescript
import { snapshotLayout, verifyLayout } from 'snaptext';

// Create a layout snapshot
const config = {
  text: 'The quick brown fox jumps over the lazy dog 🚀',
  font: '16px Inter, sans-serif',
  width: 250,
  lineHeight: 24,
};

const snapshot = snapshotLayout(config);

// Later, verify the layout is stable
const result = verifyLayout(snapshot);
console.log(result.isStable ? 'Layout is stable' : `Unstable: ${result.reason}`);
```

## API

### `snapshotLayout(config: LayoutConfig): LayoutSnapshot`

Creates a deterministic snapshot of text layout including line breaks, heights, and widths.

### `verifyLayout(snapshot: LayoutSnapshot, tolerance = 0.02): VerifyResult`

Verifies if the current layout matches the snapshot within a tolerance threshold.

## Testing & Determinism

SnapText uses Playwright for browser-based smoke testing. Because text layout relies on browser-specific Canvas APIs and DOM measurements, tests run in a real Chromium browser (headless in CI, visible locally if needed).

### Local Testing

```bash
pnpm install
pnpm build
pnpm exec playwright install chromium
pnpm test
```

For interactive debugging:
```bash
pnpm test:ui
```

### Windows Contributors

Playwright works natively on Windows — no WSL needed. Just install and run:
```powershell
pnpm install
pnpm build
pnpm exec playwright install chromium
pnpm test
```

### Test Tiers

Our smoke tests verify four critical properties:
1. **Identity**: Same config returns `isStable: true`
2. **Width Sensitivity**: 1px change triggers failure
3. **Content Sensitivity**: Text changes are caught with correct error reason
4. **Epsilon Tolerance**: Small differences within 0.02 tolerance pass

## License

MIT
