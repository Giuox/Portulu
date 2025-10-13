"use client";
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  async function login() {
    setLoading(true);
    try {
      const { authHeaders } = await import('@/lib/csrf');
      // Preflight GET to set CSRF cookie via middleware
      try { await fetch('/api/profile'); } catch {}
      const res = await fetch('/api/auth/login', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore login');
      localStorage.setItem('portulu_token', data.token);
      window.location.href = '/';
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Errore login';
      alert(message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">🍽️ Portulu</h1>
        <p className="text-gray-500 mb-6">Accesso</p>
        <div className="space-y-3">
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full border rounded-lg p-3" />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full border rounded-lg p-3" />
          <button onClick={login} disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold p-3 rounded-lg">Entra</button>
        </div>
      </div>
    </div>
  );
}


