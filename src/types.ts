// Input config (user-controlled)
export type LayoutConfig = {
  text: string;
  font: string;
  width: number;
  lineHeight: number;
};

// Snapshot 
export type LayoutSnapshot = LayoutConfig & {
  height: number;
  lineCount: number;
  lines: {
    text: string;
    width: number;
  }[];
};

/**
 * Result of verification
 */
export type VerifyResult = 
  | { isStable: true } 
  | { 
      isStable: false; 
      reason: string;
      // Machine-readable metadata:
      type: "text" | "width" | "height" | "lineCount"; 
      expected: string | number;
      actual: string | number;
      line?: number; // Only present if the error happened on a specific line
    };

export interface SnapTextFontApi {
  status: "loading" | "loaded";
  ready: Promise<any>;
}