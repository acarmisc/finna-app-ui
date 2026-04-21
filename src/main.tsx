import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { Console } from './components/console/Console';
import { getApiClient } from './services/apiClient';
import type { Toast, ToastTone } from './types';
import './components/console/Console.css';
import './components/console/Sidebar.css';
import './components/console/Toaster.css';
import './components/console/CommandPalette.css';
import './components/common/Kbd.css';

// ─── Auth Guard ─────────────────────────────────────────────────────────────

function AuthGuard({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const client = getApiClient();
      // First check if we have a token in localStorage
      const token = client.getToken?.() || localStorage.getItem('finna-auth-token');
      if (token) {
        setAuthenticated(true);
        return;
      }
      // No token - check if API is reachable (optional, just for UX)
      try {
        const result = await client.healthCheck();
        // If API is reachable but no token, show login
        setAuthenticated(false);
      } catch {
        // API unreachable - still show login
        setAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (authenticated === null) {
    return (
      <div className="fn-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="fn-spinner" style={{ width: 32, height: 32, margin: '0 auto 16px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <div className="fn-muted">Connecting to FinOps API…</div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}

// ─── Login Screen ────────────────────────────────────────────────────────────

function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const client = getApiClient();
      const result = await client.login(username, password);
      if (result.error) {
        setError(result.error.message || result.error.detail || 'Login failed');
      } else {
        window.location.reload();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-app)',
    }}>
      <form onSubmit={handleSubmit} style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
        padding: '40px', width: '100%', maxWidth: 380, boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Finna</div>
          <div className="fn-muted">FinOps Platform</div>
        </div>
        {error && (
          <div style={{
            background: 'var(--danger-weak)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)',
            padding: '10px 14px', marginBottom: 20, fontSize: 13, color: 'var(--danger)',
          }}>
            {error}
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Username</label>
          <input
            className="fn-inp"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="admin"
            autoFocus
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Password</label>
          <input
            className="fn-inp"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" disabled={loading} className="fn-btn fn-btn-primary" style={{ width: '100%' }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--fg-subtle)' }}>
          Default: admin / admin
        </p>
      </form>
    </div>
  );
}

// ─── App Router ──────────────────────────────────────────────────────────────

function AppRouter() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 8);
    setToasts(ts => [...ts, { id, ...toast }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(ts => ts.filter(t => t.id !== id));
  }, []);

  return (
    <div className="fn-app" data-theme="dark" data-density="cozy">
      <Console pushToast={pushToast} toasts={toasts} dismissToast={dismissToast} />
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────

function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="*" element={
          <AuthGuard>
            <AppRouter />
          </AuthGuard>
        } />
      </Routes>
    </BrowserRouter>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<Root />);
}
