"use client";
import { useMemo, useState } from 'react';

type Role = 'customer'|'restaurant'|'rider'|'admin';

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(() => {
    return name.trim().length >= 2 && /.+@.+\..+/.test(email) && password.length >= 6;
  }, [name, email, password]);

  async function register() {
    setLoading(true);
    try {
      setError(null);
      const { ok, data } = await (await import('@/lib/apiClient')).api.register({ email, password, name, role });
      if (!ok) throw new Error((data as any).error || 'Errore registrazione');
      window.location.href = '/login';
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Errore registrazione';
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
          <p className="opacity-90">Crea un account per iniziare a ordinare o gestire il tuo ristorante.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">Crea account</h1>
          <p className="text-gray-500 mb-6">Registrazione</p>

          {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm p-3">{error}</div>}

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nome</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Il tuo nome" className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="name@domain.com" className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Password</label>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••" className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Ruolo</label>
              <select value={role} onChange={e => setRole(e.target.value as Role)} className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="customer">Cliente</option>
                <option value="restaurant">Ristorante</option>
                <option value="rider">Rider</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button onClick={register} disabled={loading || !isValid} className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold p-3 rounded-lg">Crea account</button>
            <div className="text-sm text-gray-600 text-center">
              Hai già un account? <a href="/login" className="text-orange-600 hover:underline">Accedi</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



