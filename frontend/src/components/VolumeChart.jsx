import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useMonthlyVolume } from '../hooks/useAnalytics'

const REGION_COLORS = {
  'Africa':         '#00c48c',
  'LatAm':          '#3b82f6',
  'Middle East':    '#f59e0b',
  'Southeast Asia': '#a855f7',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '12px 16px',
      boxShadow: 'var(--shadow)',
    }}>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.name}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: p.color, marginLeft: 'auto', paddingLeft: 16 }}>
            ${(p.value / 1_000_000).toFixed(2)}M
          </span>
        </div>
      ))}
    </div>
  )
}

export default function VolumeChart() {
  const { data: raw = [], isLoading } = useMonthlyVolume()

  if (isLoading) return <Skeleton height={300} />

  // pivot: [{month, Africa, LatAm, ...}]
  const pivot = {}
  raw.forEach(({ month, region, volume }) => {
    if (!pivot[month]) pivot[month] = { month }
    pivot[month][region] = volume
  })
  const data = Object.values(pivot).sort((a, b) => a.month.localeCompare(b.month)).slice(-18)
  const regions = [...new Set(raw.map(r => r.region))]

  const shortMonth = m => {
    const [y, mo] = m.split('-')
    return ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+mo] + " '" + y.slice(2)
  }

  return (
    <Card title="MONTHLY TRANSACTION VOLUME" chip="18 months">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="month"
            tickFormatter={shortMonth}
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={v => `$${(v / 1e6).toFixed(1)}M`}
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)', paddingTop: 16 }}
            iconType="circle" iconSize={8}
          />
          {regions.map(r => (
            <Line
              key={r} type="monotone" dataKey={r}
              stroke={REGION_COLORS[r] || '#888'}
              strokeWidth={2} dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}

// ── Shared sub-components used across all chart files ──

export function Card({ title, chip, children, style = {} }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      ...style,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
        {chip && (
          <span style={{
            fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em',
            padding: '3px 8px', borderRadius: 4,
            border: '1px solid var(--border)', color: 'var(--text-muted)',
          }}>
            {chip}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

export function Skeleton({ height = 200 }) {
  return (
    <div style={{
      height, borderRadius: 'var(--radius-md)',
      background: 'linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card-hover) 50%, var(--bg-card) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
  )
}