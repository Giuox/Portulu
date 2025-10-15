"use client";
import { useMemo, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(() => /.+@.+\..+/.test(email) && password.length >= 6, [email, password]);

  async function login() {
    if (!isValid) { setError('Inserisci email valida e password (min 6)'); return; }
    setLoading(true);
    setError(null);
    try {
      const { ok, data } = await (await import('@/lib/apiClient')).api.loginPassword({ email, password });
      if (!ok) throw new Error((data as any).error || 'Errore login');
      window.location.href = '/';
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Errore login';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-orange-500 to-amber-400 p-8 text-white">
        <div className="max-w-sm">
          <div className="text-4xl font-extrabold mb-3">Portulu</div>
          <p className="opacity-90">Accedi per gestire ordini, ristoranti e consegne in tempo reale.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">Benvenuto 👋</h1>
          <p className="text-gray-500 mb-6">Accedi al tuo account</p>

          {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm p-3">{error}</div>}

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="name@domain.com" className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Password</label>
              <div className="relative">
                <input value={password} onChange={e => setPassword(e.target.value)} type={showPw ? 'text' : 'password'} placeholder="••••••" className="w-full border rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm hover:text-gray-700">
                  {showPw ? 'Nascondi' : 'Mostra'}
                </button>
              </div>
            </div>

            <button onClick={login} disabled={loading || !isValid} className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold p-3 rounded-lg">
              {loading ? 'Accesso…' : 'Entra'}
            </button>

            <div className="text-sm text-gray-600 text-center">
              Non hai un account? <a href="/register" className="text-orange-600 hover:underline">Registrati</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


