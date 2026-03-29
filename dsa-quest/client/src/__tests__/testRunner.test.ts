import { describe, it } from 'vitest'

describe('Test runner result parsing', () => {
  it.todo('all-pass result: every TestResult has passed=true')
  it.todo('partial-pass result: allPassed=false when any test fails')
  it.todo('timeout error: result has error string containing "timed out"')
  it.todo('result table has input, expected, actual, passed fields per row')
})
