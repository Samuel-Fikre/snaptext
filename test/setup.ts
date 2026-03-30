import { createCanvas } from 'canvas';

/**
 * Sets up a minimal Canvas + DOM polyfill for Pretext in Node.
 * Only for testing purposes; does not affect production code.
 */
export function setupCanvasPolyfill(): void {
  const doc = {
    createElement: (tag: string) => {
      if (tag === 'canvas') {
        const canvas = createCanvas(0, 0);
        return {
          getContext: (ctx: string) => (ctx === '2d' ? canvas.getContext('2d') : null),
          style: {},
        };
      }
      return { style: {}, appendChild: () => {} };
    },
    body: { appendChild: () => {} },
  };

  (globalThis as any).document = doc;
  (globalThis as any).window = globalThis;
}

// Automatically run polyfill in Vitest environment
setupCanvasPolyfill();