import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Analytics
export const fetchSummary       = () => api.get('/analytics/summary').then(r => r.data.data)
export const fetchMonthlyVolume = () => api.get('/analytics/monthly-volume').then(r => r.data.data)
export const fetchRegional      = () => api.get('/analytics/regional').then(r => r.data.data)
export const fetchTypeBreakdown = () => api.get('/analytics/type-breakdown').then(r => r.data.data)

// ── Churn
export const fetchChurnScores   = (params = {}) => api.get('/churn/scores', { params }).then(r => r.data)
export const fetchHighRisk      = () => api.get('/churn/high-risk').then(r => r.data)
export const fetchDistribution  = () => api.get('/churn/distribution').then(r => r.data.data)

// ── Wallets
export const fetchDormancy      = () => api.get('/wallets/dormancy').then(r => r.data.data)