export function MapLegend() {
  const items = [
    { icon: '🔒', label: 'Locked', color: '#9E9E9E' },
    { icon: '⚡', label: 'Available', color: '#D4A32E' },
    { icon: '★', label: 'Completed', color: '#7A4E2D' },
    { icon: '♛', label: 'Mastered', color: '#D4A32E' },
  ]

  return (
    <div
      className="absolute bottom-6 left-6 z-20 rounded-lg border border-brown-light/60 px-3 py-2"
      style={{
        background: 'rgba(245,230,200,0.88)',
        boxShadow: '0 2px 12px rgba(92,58,30,0.3)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <p className="font-heading text-xs text-brown-dark mb-1.5 tracking-wide">Legend</p>
      <div className="space-y-1">
        {items.map(({ icon, label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-sm">{icon}</span>
            <span className="font-body text-xs" style={{ color }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
