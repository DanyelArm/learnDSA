export const XP_PER_STAGE = {
  theory: 50,
  practice: 100,
  challenge: 200,
} as const

export const XP_BONUS_FIRST_TRY = 50
export const XP_BONUS_SPEED = 25

// Level N requires LEVEL_BASE * N^LEVEL_EXP total XP
export const LEVEL_BASE = 100
export const LEVEL_EXP = 1.5

export function xpForLevel(level: number): number {
  return Math.floor(LEVEL_BASE * Math.pow(level, LEVEL_EXP))
}

export const TOPIC_STAGES: TopicStageDef[] = [
  { key: 'theory', label: 'Theory', xp: XP_PER_STAGE.theory },
  { key: 'practice', label: 'Practice', xp: XP_PER_STAGE.practice },
  { key: 'challenge', label: 'Challenge', xp: XP_PER_STAGE.challenge },
]

interface TopicStageDef {
  key: string
  label: string
  xp: number
}
