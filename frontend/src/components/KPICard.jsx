export default function KPICard({ label, value, sub, accent = 'green', icon: IconComponent }) {
  const colors = { green: 'var(--green)', red: 'var(--red)', amber: 'var(--amber)', blue: 'var(--blue)' }
  const dims   = { green: 'var(--green-dim)', red: 'var(--red-dim)', amber: 'var(--amber-dim)', blue: 'var(--blue-dim)' }

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '20px 22px',
      display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'border-color .2s, transform .2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = colors[accent]; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.09em', color: 'var(--text-muted)', fontWeight: 600 }}>
          {label}
        </span>
        {IconComponent && (
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: dims[accent],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: colors[accent],
          }}>
            <IconComponent size={15} strokeWidth={2} />
          </div>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: colors[accent], lineHeight: 1, letterSpacing: '-0.03em' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  )
}