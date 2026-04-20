import { useState } from 'react'
import { useChurnScores, useDistribution, useTypeBreakdown } from '../hooks/useAnalytics'
import { Card } from '../components/VolumeChart'
import ChurnTable from '../components/ChurnTable'
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'

export default function Analytics() {
  const { data: dist = {} }   = useDistribution()
  const { data: types = [] }  = useTypeBreakdown()
  const { data: churnData }   = useChurnScores({ limit: 100 })
  const scores = churnData?.data || []

  const high   = dist.High   || 0
  const medium = dist.Medium || 0
  const low    = dist.Low    || 0
  const total  = high + medium + low || 1

  // top 5 highest risk
  const topRisk = scores.slice(0, 5)

  // radar data from types
  const radarData = types.map(t => ({
    type: t.type.replace(' ', '\n'),
    volume: t.avg_volume_k,
    risk: t.high_risk * 100,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeUp .4s ease both' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#000', padding: '4px 12px', borderRadius: 20, background: 'var(--green)' }}>
            Churn & Risk Analytics
          </span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', textTransform: 'uppercase', lineHeight: 1.1, marginBottom: 8 }}>
          Risk Intelligence<br />& Churn Analysis
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 480 }}>
          Deep-dive into churn probability scores, risk distribution, and fintech-level retention signals.
        </p>
      </div>

      {/* Risk tier cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { label: 'High Risk',   value: high,   color: 'var(--red)',   icon: AlertTriangle, bg: 'var(--red-dim)',   pct: `${((high/total)*100).toFixed(0)}% of fintechs` },
          { label: 'Medium Risk', value: medium, color: 'var(--amber)', icon: TrendingDown,  bg: 'var(--amber-dim)', pct: `${((medium/total)*100).toFixed(0)}% of fintechs` },
          { label: 'Low Risk',    value: low,    color: 'var(--green)', icon: CheckCircle,   bg: 'var(--green-dim)', pct: `${((low/total)*100).toFixed(0)}% of fintechs` },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '20px 22px',
            transition: 'border-color .2s, transform .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)' }}>{s.label}</span>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                <s.icon size={15} strokeWidth={2} />
              </div>
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: s.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>{s.pct}</div>
            {/* Mini bar */}
            <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginTop: 14, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(s.value/total)*100}%`, background: s.color, borderRadius: 2, transition: 'width .8s ease' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart + Top risk table */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Volume by type bar chart */}
        <Card title="Avg Volume by Fintech Type" chip="USD">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[...types].sort((a,b) => b.avg_volume_k - a.avg_volume_k)} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}k`} />
              <YAxis type="category" dataKey="type" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip
                formatter={v => [`$${v}k`, 'Avg Volume']}
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'var(--text-secondary)' }}
              />
              <Bar dataKey="avg_volume_k" fill="var(--green)" radius={[0, 4, 4, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top 5 high risk */}
        <Card title="Top Churn Risk Fintechs" chip="Ranked">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topRisk.map((f, i) => {
              const prob = ((f.churn_probability || 0) * 100).toFixed(1)
              const riskColor = f.churn_risk === 'High' ? 'var(--red)' : f.churn_risk === 'Medium' ? 'var(--amber)' : 'var(--green)'
              return (
                <div key={f.fintech_id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 8,
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', width: 16 }}>{i+1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{f.fintech_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.region} · {f.type || '—'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: riskColor }}>{prob}%</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{f.churn_risk}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Full churn table */}
      <ChurnTable />
    </div>
  )
}