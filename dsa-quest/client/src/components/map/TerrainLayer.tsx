// Decorative SVG terrain features — purely visual, no interaction

function Mountain({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  const s = scale
  return (
    <g transform={`translate(${x}, ${y})`} opacity={0.5}>
      {/* Back peak */}
      <polygon
        points={`${-50 * s},${0} ${0},${-80 * s} ${50 * s},${0}`}
        fill="#9E9E9E"
        stroke="#666"
        strokeWidth={1.5}
      />
      {/* Snow cap */}
      <polygon
        points={`${-15 * s},${-55 * s} ${0},${-80 * s} ${15 * s},${-55 * s}`}
        fill="white"
        opacity={0.7}
      />
      {/* Front peak */}
      <polygon
        points={`${-35 * s},${0} ${20 * s},${-65 * s} ${70 * s},${0}`}
        fill="#8B8B8B"
        stroke="#666"
        strokeWidth={1.5}
      />
      <polygon
        points={`${10 * s},${-48 * s} ${20 * s},${-65 * s} ${30 * s},${-48 * s}`}
        fill="white"
        opacity={0.7}
      />
    </g>
  )
}

function Tree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  const s = scale
  return (
    <g transform={`translate(${x}, ${y})`} opacity={0.55}>
      <rect x={-4 * s} y={-10 * s} width={8 * s} height={20 * s} fill="#5C3A1E" />
      <polygon
        points={`${0},${-55 * s} ${-22 * s},${-10 * s} ${22 * s},${-10 * s}`}
        fill="#2D5A27"
      />
      <polygon
        points={`${0},${-42 * s} ${-18 * s},${-5 * s} ${18 * s},${-5 * s}`}
        fill="#3D7A35"
      />
      <polygon
        points={`${0},${-30 * s} ${-14 * s},${3 * s} ${14 * s},${3 * s}`}
        fill="#2D5A27"
      />
    </g>
  )
}

function ForestCluster({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Tree x={x} y={y} scale={1.2} />
      <Tree x={x + 45} y={y - 10} scale={0.9} />
      <Tree x={x - 40} y={y + 5} scale={1.0} />
      <Tree x={x + 20} y={y + 15} scale={0.8} />
      <Tree x={x - 15} y={y - 20} scale={1.1} />
    </g>
  )
}

function MountainRange({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <Mountain x={x} y={y} scale={1.3} />
      <Mountain x={x + 90} y={y + 15} scale={1.0} />
      <Mountain x={x - 80} y={y + 20} scale={0.85} />
    </g>
  )
}

function CompassRose({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`} opacity={0.6}>
      {/* Outer circle */}
      <circle r={55} fill="none" stroke="#D4A32E" strokeWidth={1.5} />
      <circle r={45} fill="rgba(212,163,46,0.08)" stroke="#D4A32E" strokeWidth={0.5} />
      {/* Cardinal points */}
      {['N', 'E', 'S', 'W'].map((dir, i) => {
        const angle = i * 90 - 90
        const rad = (angle * Math.PI) / 180
        const tx = Math.cos(rad) * 38
        const ty = Math.sin(rad) * 38
        return (
          <text
            key={dir}
            x={tx}
            y={ty + 5}
            textAnchor="middle"
            fontSize={14}
            fontFamily="serif"
            fontWeight="bold"
            fill="#D4A32E"
          >
            {dir}
          </text>
        )
      })}
      {/* Cross lines */}
      <line x1={0} y1={-45} x2={0} y2={45} stroke="#D4A32E" strokeWidth={0.8} opacity={0.5} />
      <line x1={-45} y1={0} x2={45} y2={0} stroke="#D4A32E" strokeWidth={0.8} opacity={0.5} />
      {/* Needle */}
      <polygon points="0,-30 -6,0 0,8 6,0" fill="#8B1A1A" opacity={0.8} />
      <polygon points="0,30 -6,0 0,-8 6,0" fill="#D4A32E" opacity={0.8} />
      <circle r={5} fill="#5C3A1E" stroke="#D4A32E" strokeWidth={1} />
    </g>
  )
}

function River({ points }: { points: [number, number][] }) {
  const d =
    'M ' +
    points
      .map(([x, y], i) => {
        if (i === 0) return `${x} ${y}`
        const prev = points[i - 1]
        const cpx = (prev[0] + x) / 2 + (Math.random() - 0.5) * 30
        const cpy = (prev[1] + y) / 2
        return `Q ${cpx} ${cpy} ${x} ${y}`
      })
      .join(' ')

  return (
    <g opacity={0.45}>
      <path d={d} fill="none" stroke="#1A4B6E" strokeWidth={12} strokeLinecap="round" />
      <path d={d} fill="none" stroke="#2460A0" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
      <path d={d} fill="none" stroke="#5B9BD5" strokeWidth={2} strokeLinecap="round" strokeDasharray="20 15" opacity={0.5} />
    </g>
  )
}

function TitleBanner({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Scroll background */}
      <rect
        x={-200} y={-35}
        width={400} height={70}
        rx={8}
        fill="rgba(245,230,200,0.85)"
        stroke="#7A4E2D"
        strokeWidth={2.5}
      />
      {/* Scroll end caps */}
      <ellipse cx={-200} cy={0} rx={12} ry={35} fill="#E8D4A8" stroke="#7A4E2D" strokeWidth={2} />
      <ellipse cx={200} cy={0} rx={12} ry={35} fill="#E8D4A8" stroke="#7A4E2D" strokeWidth={2} />

      <text
        x={0} y={-8}
        textAnchor="middle"
        fontSize={28}
        fontFamily='"Pirata One", serif'
        fill="#3D2510"
        letterSpacing={3}
      >
        DSA QUEST
      </text>
      <text
        x={0} y={18}
        textAnchor="middle"
        fontSize={13}
        fontFamily="Georgia, serif"
        fill="#5C3A1E"
        fontStyle="italic"
      >
        The Grand Map of Algorithmic Knowledge
      </text>
    </g>
  )
}

function HereBeText({ x, y }: { x: number; y: number }) {
  return (
    <text
      x={x} y={y}
      textAnchor="middle"
      fontSize={18}
      fontFamily="Georgia, serif"
      fontStyle="italic"
      fill="#1A4B6E"
      opacity={0.45}
      transform={`rotate(-15, ${x}, ${y})`}
    >
      ~ Here be Dragons ~
    </text>
  )
}

export function TerrainLayer() {
  return (
    <g>
      {/* Title banner at top center */}
      <TitleBanner x={1500} y={130} />

      {/* Mountain ranges — upper right region */}
      <MountainRange x={2750} y={550} />
      <MountainRange x={2600} y={450} />
      <Mountain x={2800} y={700} scale={0.7} />

      {/* Forest clusters — lower middle and left */}
      <ForestCluster x={380} y={1250} />
      <ForestCluster x={700} y={1320} />
      <ForestCluster x={150} y={1400} />
      <ForestCluster x={1600} y={1700} />
      <ForestCluster x={2050} y={1680} />
      <ForestCluster x={2350} y={1680} />
      <ForestCluster x={900} y={900} />
      <ForestCluster x={1200} y={950} />

      {/* River flowing down left edge */}
      <River
        points={[
          [80, 300],
          [120, 500],
          [90, 750],
          [130, 1000],
          [100, 1200],
          [150, 1500],
          [120, 1750],
          [180, 1950],
        ]}
      />

      {/* Ocean area bottom left */}
      <ellipse cx={100} cy={1880} rx={200} ry={100} fill="#1A4B6E" opacity={0.2} />

      {/* Compass rose — bottom right */}
      <CompassRose x={2820} y={1850} />

      {/* "Here be Dragons" — bottom ocean area */}
      <HereBeText x={160} y={1800} />

      {/* Decorative border dots at corners */}
      {[
        [40, 40], [2960, 40], [40, 1960], [2960, 1960],
        [1500, 40], [1500, 1960], [40, 1000], [2960, 1000],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={6} fill="#D4A32E" opacity={0.4} />
      ))}

      {/* Border frame */}
      <rect
        x={20} y={20}
        width={2960} height={1960}
        fill="none"
        stroke="#D4A32E"
        strokeWidth={2}
        opacity={0.25}
        strokeDasharray="20 10"
      />
    </g>
  )
}
