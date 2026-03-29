import type { TestResult } from '@dsa-quest/shared'

export interface TestRunSummary {
  total: number
  passed: number
  failed: number
  allPassed: boolean
}

export function aggregateTestResults(results: TestResult[]): TestRunSummary {
  const passed = results.filter((r) => r.passed).length
  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    allPassed: results.length > 0 && passed === results.length,
  }
}
