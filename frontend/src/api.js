import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({ baseURL: BASE })

export const getProfile = (id) => api.get(`/profile/${id}`)
export const saveProfile = (session_id, skills) => api.post('/profile', { session_id, skills })
export const getCareers = () => api.get('/careers')
export const getReadiness = (id) => api.get(`/readiness/${id}`)
export const addConnection = (data) => api.post('/connection', data)
export const getRoadmap = (data) => api.post('/roadmap', data)