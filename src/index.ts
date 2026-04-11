import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";
import { LayoutConfig, LayoutSnapshot, VerifyResult, SnapTextFontApi } from "./types";

export async function snapshotLayout(config: LayoutConfig): Promise<LayoutSnapshot> {

  const normalizedText = config.text.normalize("NFC");
  const { font, width, lineHeight } = config;

  if (process.env.NODE_ENV !== "production") {
    // 1. Empty Text
    if (!normalizedText || normalizedText.trim().length === 0) {
      console.warn(`[SnapText] ⚠️ snapshotLayout called with empty text...`);
    }
    // 2. Extreme Width
    if (width > 5000) {
      console.warn(`[SnapText] ⚠️ Large width detected (${width}px)...`);
    }
    // 3. Font Loading Status
    if (typeof document !== "undefined" && "fonts" in document) {
      const fontsApi = (document as any).fonts as SnapTextFontApi;
      if (fontsApi.status === "loading") {
        console.warn(`[SnapText] ⚠️ Fonts are still in 'loading' status...`);
      }
    }
  }

  // Wait for fonts to be ready in browser environments
  if (typeof document !== "undefined" && "fonts" in document) {
    await document.fonts.ready;
  }

  const prepared = prepareWithSegments(normalizedText, font);
  const detailed = layoutWithLines(prepared, width, lineHeight);

  return {
    text: normalizedText,
    font,
    width,
    lineHeight,
    height: detailed.height,
    lineCount: detailed.lines.length,
    lines: detailed.lines.map((l) => ({
      text: l.text,
      width: l.width,
      start: l.start,
      end: l.end,
    })),
  };
}

export async function verifyLayout(
  snapshot: LayoutSnapshot,
  tolerance = 0.02
): Promise<VerifyResult> {
  const { text, font, width, lineHeight } = snapshot;

  const current = await snapshotLayout({ text, font, width, lineHeight });

  // 1. Height check (Fastest fail)
  if (Math.abs(current.height - snapshot.height) > tolerance) {
    return {
      isStable: false,
      reason: `height mismatch: expected ${snapshot.height}, got ${current.height}`,
      type: "height",
      expected: snapshot.height,
      actual: current.height,
    };
  }

  // 2. Line count check
  if (current.lineCount !== snapshot.lineCount) {
    return {
      isStable: false,
      reason: `lineCount mismatch: expected ${snapshot.lineCount}, got ${current.lineCount}`,
      type: "lineCount",
      expected: snapshot.lineCount,
      actual: current.lineCount,
    };
  }

  // 3. Array Structure check
  if (current.lines.length !== snapshot.lines.length) {
    return {
      isStable: false,
      reason: "internal line array length mismatch",
      type: "lineCount",
      expected: snapshot.lines.length,
      actual: current.lines.length,
    };
  }

  // 4. Per-line content and width comparison
  for (let i = 0; i < snapshot.lines.length; i++) {
    const s = snapshot.lines[i];
    const c = current.lines[i];

    // Check if the word-wrap moved text to a different line
    if (s.text !== c.text) {
      return {
        isStable: false,
        reason: `text mismatch at line ${i}: "${s.text}" vs "${c.text}"`,
        type: "text",
        expected: s.text,
        actual: c.text,
        line: i,
      };
    }

    // Check if the pixel-width drifted beyond tolerance
    if (Math.abs(s.width - c.width) > tolerance) {
      return {
        isStable: false,
        reason: `width mismatch at line ${i}: ${s.width}px vs ${c.width}px`,
        type: "width",
        expected: s.width,
        actual: c.width,
        line: i,
      };
    }

    // NOTE: We skip the s.start/s.end check to avoid 
    // coupling to Pretext's internal segmentation logic.
  }

  // Layout is stable within tolerance
  return { isStable: true };
}