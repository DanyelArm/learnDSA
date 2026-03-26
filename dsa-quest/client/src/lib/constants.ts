export const WORLD_WIDTH = 3000
export const WORLD_HEIGHT = 2000

export interface TopicNodeConfig {
  order: number
  x: number
  y: number
  label: string
  shortLabel: string
  icon: string // SVG path or identifier
}

export const TOPIC_NODES: TopicNodeConfig[] = [
  { order: 1,  x: 280,  y: 1650, label: 'Big-O Notation',       shortLabel: 'Big-O',      icon: 'sigma' },
  { order: 2,  x: 520,  y: 1480, label: 'Arrays & Strings',     shortLabel: 'Arrays',     icon: 'array' },
  { order: 3,  x: 820,  y: 1580, label: 'Linked Lists',         shortLabel: 'Links',      icon: 'chain' },
  { order: 4,  x: 1050, y: 1400, label: 'Stacks',               shortLabel: 'Stack',      icon: 'stack' },
  { order: 5,  x: 1280, y: 1550, label: 'Queues & Deques',      shortLabel: 'Queue',      icon: 'queue' },
  { order: 6,  x: 1520, y: 1380, label: 'Hash Tables',          shortLabel: 'Hash',       icon: 'hash' },
  { order: 7,  x: 1780, y: 1500, label: 'Recursion',            shortLabel: 'Recurse',    icon: 'recurse' },
  { order: 8,  x: 1980, y: 1300, label: 'Sorting Algorithms',   shortLabel: 'Sort',       icon: 'sort' },
  { order: 9,  x: 2220, y: 1450, label: 'Searching Algorithms', shortLabel: 'Search',     icon: 'search' },
  { order: 10, x: 2480, y: 1250, label: 'Trees & BST',          shortLabel: 'Trees',      icon: 'tree' },
  { order: 11, x: 2650, y: 1000, label: 'Heaps',                shortLabel: 'Heap',       icon: 'heap' },
  { order: 12, x: 2450, y: 780,  label: 'Graph Representation', shortLabel: 'Graph',      icon: 'graph' },
  { order: 13, x: 2180, y: 620,  label: 'Graph Traversal',      shortLabel: 'BFS/DFS',    icon: 'traverse' },
  { order: 14, x: 1900, y: 750,  label: 'DP Basics',            shortLabel: 'DP I',       icon: 'dp' },
  { order: 15, x: 1620, y: 580,  label: 'DP Advanced',          shortLabel: 'DP II',      icon: 'dp' },
  { order: 16, x: 1380, y: 720,  label: 'Greedy Algorithms',    shortLabel: 'Greedy',     icon: 'greedy' },
  { order: 17, x: 1100, y: 580,  label: 'Backtracking',         shortLabel: 'Backtrack',  icon: 'backtrack' },
  { order: 18, x: 850,  y: 720,  label: 'Tries',                shortLabel: 'Trie',       icon: 'trie' },
  { order: 19, x: 580,  y: 550,  label: 'Union-Find',           shortLabel: 'Union',      icon: 'union' },
  { order: 20, x: 350,  y: 380,  label: 'Segment & Fenwick Trees', shortLabel: 'Seg/BIT', icon: 'advanced' },
]

// XP thresholds: Level N requires this much cumulative XP
export const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000]

export function getLevelFromXP(xp: number): { level: number; progress: number; nextThreshold: number } {
  let level = 1
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1
    else break
  }
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const progress = nextThreshold > currentThreshold
    ? (xp - currentThreshold) / (nextThreshold - currentThreshold)
    : 1
  return { level, progress, nextThreshold }
}
