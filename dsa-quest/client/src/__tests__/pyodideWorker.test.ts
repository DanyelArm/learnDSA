import { describe, it } from 'vitest'

describe('Pyodide worker message protocol', () => {
  it.todo('postMessage payload has shape { id, code, testCases, functionName }')
  it.todo('onmessage response has shape { id, results } on success')
  it.todo('onmessage response has shape { id, error } on Python syntax error')
  it.todo('worker.terminate() is called on 10-second timeout')
})
