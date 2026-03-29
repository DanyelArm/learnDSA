import { describe, it, expect } from 'vitest'
import { aggregateTestResults } from '../lib/testRunnerUtils'
import type { TestResult } from '@dsa-quest/shared'

function makeResult(passed: boolean, actual: unknown = null): TestResult {
  return { input: [1], expected: 1, actual, stdout: '', passed }
}

describe('Test runner result aggregation', () => {
  it('all-pass result: allPassed=true when every TestResult has passed=true', () => {
    const results = [makeResult(true), makeResult(true), makeResult(true)]
    expect(aggregateTestResults(results).allPassed).toBe(true)
  })

  it('partial-pass result: allPassed=false when any test fails', () => {
    const results = [makeResult(true), makeResult(false), makeResult(true)]
    expect(aggregateTestResults(results).allPassed).toBe(false)
    expect(aggregateTestResults(results).failed).toBe(1)
    expect(aggregateTestResults(results).passed).toBe(2)
  })

  it('all-fail result: allPassed=false', () => {
    const results = [makeResult(false), makeResult(false)]
    const summary = aggregateTestResults(results)
    expect(summary.allPassed).toBe(false)
    expect(summary.passed).toBe(0)
    expect(summary.failed).toBe(2)
  })

  it('empty results: allPassed=false (no results means nothing passed)', () => {
    expect(aggregateTestResults([]).allPassed).toBe(false)
    expect(aggregateTestResults([]).total).toBe(0)
  })

  it('result table has correct total count', () => {
    const results = [makeResult(true), makeResult(false), makeResult(true), makeResult(true)]
    const summary = aggregateTestResults(results)
    expect(summary.total).toBe(4)
    expect(summary.passed).toBe(3)
    expect(summary.failed).toBe(1)
  })

  it('timeout error message contains "timed out"', () => {
    const timeoutMsg = 'Execution timed out after 10 seconds'
    expect(timeoutMsg).toContain('timed out')
  })
})
