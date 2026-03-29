import type { TestResult } from '@dsa-quest/shared'

interface Props {
  results: TestResult[]
}

export function TestResultTable({ results }: Props) {
  if (results.length === 0) return null

  const allPassed = results.every((r) => r.passed)

  return (
    <div className="mt-4">
      <div className={[
        'text-xs font-heading px-3 py-1 rounded mb-2 inline-block',
        allPassed ? 'bg-forest/20 text-forest' : 'bg-crimson/20 text-crimson',
      ].join(' ')}>
        {allPassed
          ? `All ${results.length} tests passed`
          : `${results.filter((r) => !r.passed).length}/${results.length} tests failed`}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono border-collapse">
          <thead>
            <tr className="bg-brown/10">
              <th className="text-left px-3 py-2 text-brown-dark font-heading font-normal text-xs">#</th>
              <th className="text-left px-3 py-2 text-brown-dark font-heading font-normal text-xs">Input</th>
              <th className="text-left px-3 py-2 text-brown-dark font-heading font-normal text-xs">Expected</th>
              <th className="text-left px-3 py-2 text-brown-dark font-heading font-normal text-xs">Actual</th>
              <th className="text-left px-3 py-2 text-brown-dark font-heading font-normal text-xs">Stdout</th>
              <th className="text-left px-3 py-2 text-brown-dark font-heading font-normal text-xs">Result</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className={r.passed ? 'bg-forest/5' : 'bg-crimson/5'}>
                <td className="px-3 py-2 text-brown/60">{i + 1}</td>
                <td className="px-3 py-2 text-brown font-mono">{JSON.stringify(r.input)}</td>
                <td className="px-3 py-2 text-brown font-mono">{JSON.stringify(r.expected)}</td>
                <td className="px-3 py-2 text-brown font-mono">{JSON.stringify(r.actual)}</td>
                <td className="px-3 py-2 text-brown/70 font-mono max-w-xs truncate">{r.stdout || '—'}</td>
                <td className={['px-3 py-2 font-heading font-semibold', r.passed ? 'text-forest' : 'text-crimson'].join(' ')}>
                  {r.passed ? 'pass' : 'fail'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
