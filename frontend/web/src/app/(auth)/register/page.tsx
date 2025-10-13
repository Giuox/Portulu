"use client";
import { useState } from 'react';

type Role = 'customer'|'restaurant'|'rider'|'admin';

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>('customer');
  const [loading, setLoading] = useState(false);

  async function register() {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore registrazione');
      window.location.href = '/login';
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Errore registrazione';
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">🍽️ Portulu</h1>
        <p className="text-gray-500 mb-6">Registrazione</p>
        <div className="space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome" className="w-full border rounded-lg p-3" />
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full border rounded-lg p-3" />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full border rounded-lg p-3" />
          <select value={role} onChange={e => setRole(e.target.value as Role)} className="w-full border rounded-lg p-3">
            <option value="customer">Cliente</option>
            <option value="restaurant">Ristorante</option>
            <option value="rider">Rider</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={register} disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold p-3 rounded-lg">Crea account</button>
        </div>
      </div>
    </div>
  );
}



