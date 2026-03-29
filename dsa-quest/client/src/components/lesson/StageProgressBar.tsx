import type { UserProgressDTO } from '@dsa-quest/shared'

interface Props {
  progress: UserProgressDTO | null
}

type StageStatus = 'completed' | 'current' | 'locked'

export function StageProgressBar({ progress }: Props) {
  function stageStatus(stage: 'theory' | 'practice' | 'challenge'): StageStatus {
    if (!progress) return stage === 'theory' ? 'current' : 'locked'
    if (stage === 'theory') return progress.quizPassed ? 'completed' : 'current'
    if (stage === 'practice') {
      if (progress.practiceCompleted) return 'completed'
      return progress.quizPassed ? 'current' : 'locked'
    }
    // challenge
    if (progress.challengeCompleted) return 'completed'
    return progress.practiceCompleted ? 'current' : 'locked'
  }

  const stages: Array<{ key: 'theory' | 'practice' | 'challenge'; label: string; icon: string }> = [
    { key: 'theory', label: 'The Scroll', icon: '📜' },
    { key: 'practice', label: 'The Forge', icon: '⚒️' },
    { key: 'challenge', label: 'The Arena', icon: '⚔️' },
  ]

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-heading text-sm text-brown-dark uppercase tracking-widest mb-1">Your Quest</h3>
      {stages.map(({ key, label, icon }) => {
        const status = stageStatus(key)
        return (
          <div
            key={key}
            className={[
              'flex items-center gap-3 px-3 py-2 rounded border',
              status === 'completed' ? 'border-gold bg-gold/10 text-brown-dark' : '',
              status === 'current' ? 'border-forest bg-forest/10 text-forest font-semibold' : '',
              status === 'locked' ? 'border-brown/20 bg-brown/5 text-brown/40' : '',
            ].join(' ')}
          >
            <span className="text-lg">{status === 'locked' ? '🔒' : icon}</span>
            <span className="font-body text-sm">{label}</span>
            {status === 'completed' && <span className="ml-auto text-xs text-gold font-heading">✓ Done</span>}
            {status === 'current' && <span className="ml-auto text-xs text-forest font-heading">► Active</span>}
          </div>
        )
      })}
    </div>
  )
}
