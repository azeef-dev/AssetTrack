const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const UPLOADS_BASE = API_URL.replace(/\/api\/?$/, '')

export const fileUrl = (path) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return `${UPLOADS_BASE}${path}`
}

const getToken = () => localStorage.getItem('miq_token')

async function request(path, { method = 'GET', body, isForm = false, auth = true } = {}) {
    const headers = {}
    if (!isForm) headers['Content-Type'] = 'application/json'
    if (auth) {
        const token = getToken()
        if (token) headers['Authorization'] = `Bearer ${token}`
    }

    let res
    try {
        res = await fetch(`${API_URL}${path}`, {
            method,
            headers,
            body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
        })
    } catch (err) {
        throw new Error('Could not reach the server. Is the backend running?', { cause: err })
    }

    let data
    try {
        data = await res.json()
    } catch {
        data = null
    }

    if (!res.ok) {
        const message = data?.message || `Request failed (${res.status})`
        const error = new Error(message)
        error.status = res.status
        error.errors = data?.errors || []
        throw error
    }

    return data
}

export const api = {
    get: (path) => request(path, { method: 'GET' }),
    post: (path, body, opts = {}) => request(path, { method: 'POST', body, ...opts }),
    put: (path, body, opts = {}) => request(path, { method: 'PUT', body, ...opts }),
    del: (path) => request(path, { method: 'DELETE' }),
    public: {
        get: (path) => request(path, { method: 'GET', auth: false }),
        post: (path, body, opts = {}) => request(path, { method: 'POST', body, auth: false, ...opts }),
    },
}

export { getToken }