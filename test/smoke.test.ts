import { describe, it, expect, beforeEach } from 'vitest'
import { snapshotLayout, verifyLayout } from '../src/index.js'

const mockConfig = {
  text: 'The quick brown fox jumps over the lazy dog 🚀',
  font: '16px Inter, sans-serif', // fallback to ensure consistency
  width: 250,
  lineHeight: 24,
}

describe('SnapText Smoke Tests', () => {
  let original: ReturnType<typeof snapshotLayout>

  beforeEach(() => {
    original = snapshotLayout(mockConfig)
  })

  it('Tier 1: Identity check - same config returns isStable: true', () => {
    expect(verifyLayout(original).isStable).toBe(true)
  })

  it('Tier 2: Width sensitivity - 1px change triggers failure', () => {
    const wider = { ...original, width: original.width + 1 }
    const result = verifyLayout(wider)
    expect(result.isStable).toBe(false)
    expect(result.reason).toContain('width')
  })

  it('Tier 3: Content sensitivity - text change triggers failure with correct reason', () => {
    const altered = { ...original, text: original.text + '!' }
    const result = verifyLayout(altered)
    expect(result.isStable).toBe(false)
    expect(result.reason).toContain('text')
  })

  it('Tier 4: Epsilon tolerance - small differences within tolerance pass', () => {
    const epsilonResult = verifyLayout(original, 0.05)
    expect(epsilonResult.isStable).toBe(true)
  })

  it('Optional: Epsilon boundary - difference exactly at tolerance fails', () => {
    const boundary = { ...original }
    if (boundary.lines.length > 0) {
      boundary.lines[0].width += 0.05
      const result = verifyLayout(boundary, 0.05)
      expect(result.isStable).toBe(false)
      expect(result.reason).toContain('width')
    }
  })
})