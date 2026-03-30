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
export type VerifyResult = {
  isStable: boolean;
  reason?: string;
};