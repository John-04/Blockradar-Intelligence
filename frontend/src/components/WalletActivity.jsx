import { useDormancy } from '../hooks/useAnalytics'
import { Card, Skeleton } from './VolumeChart'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

export default function WalletActivity() {
  const { data, isLoading } = useDormancy()

  if (isLoading) return <Skeleton height={260} />

  const byRegion = data?.by_region || []
  const chartData = byRegion.map(r => ({
    region: r.region,
    Active: +((r.activation_rate || 0) * 100).toFixed(1),
    Dormant: +((r.dormancy_rate || 0) * 100).toFixed(1),
  }))

  const overall = data?.overall || {}

  return (
    <Card title="Wallet Activation vs Dormancy" chip="by region">
      {/* Overall pills */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Wallets',   value: (overall.total_wallets || 0).toLocaleString(),   color: 'var(--text-primary)' },
          { label: 'Active',          value: (overall.active_wallets || 0).toLocaleString(),   color: 'var(--green)' },
          { label: 'Dormant',         value: (overall.dormant_wallets || 0).toLocaleString(),  color: 'var(--red)' },
          { label: 'Dormancy Rate',   value: `${((overall.dormancy_rate || 0) * 100).toFixed(1)}%`, color: 'var(--amber)' },
        ].map(p => (
          <div key={p.label} style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 14px',
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.06em' }}>{p.label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: p.color }}>{p.value}</div>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="region" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={v => `${v}%`} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(v, n) => [`${v}%`, n]}
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: 'var(--text-secondary)' }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} iconType="circle" iconSize={8} />
          <Bar dataKey="Active"  fill="#00c48c" radius={[4,4,0,0]} maxBarSize={40} />
          <Bar dataKey="Dormant" fill="#ef444460" radius={[4,4,0,0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}