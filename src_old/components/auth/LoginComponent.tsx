import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { getApiClient } from '@/services/apiClient'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuthStore()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setError('')
    setLoading(true)

    try {
      const client = getApiClient()
      const res = await client.login(username, password)
      if (res.error || !res.data?.token) {
        setError(res.error?.message || 'Invalid credentials')
      } else {
        login(res.data.token)
      }
    } catch (e: any) {
      setError(e.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-hd">
          <span className="caret">&gt; </span>finna login<span className="cursor-blink">_</span>
        </div>
        <form className="login-bd" onSubmit={handleSubmit}>
          <div className="field">
            <div className="label">username</div>
            <input
              className={`inp ${error ? 'error' : ''}`}
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              autoFocus
            />
          </div>
          <div className="field">
            <div className="label">password</div>
            <input
              type="password"
              className={`inp ${error ? 'error' : ''}`}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••"
            />
            {error && <div className="hint error">// {error}</div>}
          </div>
          <div className="field" style={{ marginTop: 20 }}>
            <button type="submit" disabled={loading} className="bracket block">
              {loading ? 'authenticating...' : '[ authenticate ]'}
            </button>
          </div>
        </form>
        <div className="login-foot">
          <span>finna console</span>
          <span>v2.4.1</span>
        </div>
      </div>
    </div>
  )
}
