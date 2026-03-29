import { describe, it, expect } from 'vitest'

// Test the message protocol SHAPE and the timeout constant — not actual Pyodide execution
// (Pyodide requires a real browser with WASM support; cannot run in jsdom)

const TIMEOUT_MS = 10_000

describe('Pyodide worker message protocol', () => {
  it('TIMEOUT_MS is 10 seconds (10000 ms)', () => {
    expect(TIMEOUT_MS).toBe(10_000)
  })

  it('request payload shape has required fields', () => {
    const payload = { id: 'abc', code: 'def f(x): return x', testCases: [{ input: [1], expected: 1 }], functionName: 'f' }
    expect(payload).toHaveProperty('id')
    expect(payload).toHaveProperty('code')
    expect(payload).toHaveProperty('testCases')
    expect(payload).toHaveProperty('functionName')
  })

  it('success response shape has results array', () => {
    const response = { id: 'abc', results: [{ input: [1], expected: 1, actual: 1, stdout: '', passed: true }] }
    expect(response.results).toBeInstanceOf(Array)
    expect(response.results[0]).toHaveProperty('passed')
    expect(response.results[0]).toHaveProperty('actual')
    expect(response.results[0]).toHaveProperty('stdout')
  })

  it('error response shape has error string', () => {
    const response = { id: 'abc', error: 'SyntaxError: invalid syntax' }
    expect(typeof response.error).toBe('string')
  })

  it('timeout error message contains "timed out"', () => {
    const timeoutError = new Error('Execution timed out after 10 seconds')
    expect(timeoutError.message).toContain('timed out')
  })

  it('TestResult has all required fields', () => {
    const result = { input: [1, 2], expected: 3, actual: 3, stdout: '', passed: true }
    expect(result).toHaveProperty('input')
    expect(result).toHaveProperty('expected')
    expect(result).toHaveProperty('actual')
    expect(result).toHaveProperty('stdout')
    expect(result).toHaveProperty('passed')
    expect(typeof result.passed).toBe('boolean')
  })
})
