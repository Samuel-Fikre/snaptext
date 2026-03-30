import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";
import { LayoutConfig, LayoutSnapshot, VerifyResult } from "./types";

export function snapshotLayout(config: LayoutConfig): LayoutSnapshot {
  const { text, font, width, lineHeight } = config;

  const prepared = prepareWithSegments(text, font);
  const detailed = layoutWithLines(prepared, width, lineHeight);

  return {
    text,
    font,
    width,
    lineHeight,
    height: detailed.height,
    lineCount: detailed.lines.length,
    lines: detailed.lines.map((l) => ({
      text: l.text,
      width: l.width,
    })),
  };
}

export function verifyLayout(
  snapshot: LayoutSnapshot,
  tolerance = 0.02
): VerifyResult {
  const { text, font, width, lineHeight } = snapshot;

  const current = snapshotLayout({ text, font, width, lineHeight });

  // height check
  if (Math.abs(current.height - snapshot.height) > tolerance) {
    return { isStable: false, reason: "height mismatch" };
  }

  // line count check
  if (current.lineCount !== snapshot.lineCount) {
    return { isStable: false, reason: "lineCount mismatch" };
  }

  // line length check (critical)
  if (current.lines.length !== snapshot.lines.length) {
    return { isStable: false, reason: "line length mismatch" };
  }

  // line-by-line comparison
  for (let i = 0; i < snapshot.lines.length; i++) {
    const s = snapshot.lines[i];
    const c = current.lines[i];

    if (s.text !== c.text) {
      return { isStable: false, reason: `text mismatch at line ${i}` };
    }

    if (Math.abs(s.width - c.width) > tolerance) {
      return { isStable: false, reason: `width mismatch at line ${i}` };
    }
  }

  return { isStable: true };
}
