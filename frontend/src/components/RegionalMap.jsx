import { useRegional } from '../hooks/useAnalytics'
import { Card, Skeleton } from './VolumeChart'

const REGION_COLORS = {
  'Africa':         '#00c48c',
  'LatAm':          '#3b82f6',
  'Middle East':    '#f59e0b',
  'Southeast Asia': '#a855f7',
}

export default function RegionalMap() {
  const { data = [], isLoading } = useRegional()

  if (isLoading) return <Skeleton height={320} />

  return (
    <Card title="Regional Performance" chip="4 regions">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {data.map(r => {
          const color = REGION_COLORS[r.region] || '#888'
          const activation = ((r.activation_rate || 0) * 100).toFixed(1)
          const dormancy = ((r.dormancy_rate || 0) * 100).toFixed(1)
          const churn = ((r.avg_churn_prob || 0) * 100).toFixed(1)
          const volumeM = ((r.total_volume || 0) / 1e6).toFixed(2)

          return (
            <div key={r.region} style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              transition: 'border-color .2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = color}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {/* Region name */}
              <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 14 }}>
                {r.region}
              </div>

              {/* Stats */}
              {[
                { label: 'Fintechs',  value: r.fintechs },
                { label: 'Wallets',   value: (r.total_wallets || 0).toLocaleString() },
                { label: 'Volume',    value: `$${volumeM}M` },
                { label: 'Churn Risk', value: `${churn}%`, warn: +churn > 15 },
              ].map(s => (
                <div key={s.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 8,
                }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</span>
                  <span style={{
                    fontSize: 13, fontWeight: 600,
                    color: s.warn ? 'var(--red)' : 'var(--text-primary)',
                  }}>
                    {s.value}
                  </span>
                </div>
              ))}

              {/* Activation bar */}
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Active wallets</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color }}>{activation}%</span>
                </div>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${activation}%`,
                    background: color, borderRadius: 2,
                    transition: 'width .8s ease',
                  }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}