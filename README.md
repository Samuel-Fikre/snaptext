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

SnapText uses Vitest for smoke testing layout stability. Because text layout relies on engine-specific math, we use a 0.02 epsilon tolerance to account for minor browser/environment drift.

### Local Testing

```bash
pnpm install
pnpm test
```

**Note:** This package depends on `canvas` for DOM-free testing. If you encounter installation issues on Windows, ensure you have the necessary build tools or use WSL (Ubuntu) which mirrors the CI environment perfectly.

### Windows Canvas Headache

The `canvas` package has native dependencies. On Windows:
- **Option 1:** Install [windows-build-tools](https://github.com/felixrieseberg/windows-build-tools) and Python
- **Option 2:** Use WSL (recommended) — `wsl`, then run `pnpm install` and `pnpm test`

Contributors: If you're on Windows, we recommend running tests in WSL or relying on the CI.

## License

MIT
