"use client";
import { useCallback, useEffect, useState } from 'react';

type Order = {
  id: number;
  order_number: string;
  delivery_address: string;
  delivery_zone: string;
  total: number;
  status: 'new'|'preparing'|'ready'|'delivering'|'delivered'|'cancelled';
};

export default function RiderPage() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('portulu_token') : null;
  const [available, setAvailable] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = useCallback(async () => {
    if (!token) { window.location.href = '/login'; return; }
    const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) { console.error(data.error); return; }
    setOrders(data);
  }, [token]);

  async function saveAvailability(next: boolean) {
    if (!token) return;
    const { authHeaders } = await import('@/lib/csrf');
    const res = await fetch('/api/rider/availability', { method: 'PATCH', headers: authHeaders(token || undefined), body: JSON.stringify({ available: next }) });
    if (res.ok) setAvailable(next);
  }

  const takeOrder = useCallback(async (orderId: number) => {
    if (!token) return;
    const { authHeaders } = await import('@/lib/csrf');
    await fetch(`/api/orders/${orderId}/status`, { method: 'PATCH', headers: authHeaders(token || undefined), body: JSON.stringify({ status: 'delivering' }) });
    await loadOrders();
  }, [token, loadOrders]);

  const completeOrder = useCallback(async (orderId: number) => {
    if (!token) return;
    const { authHeaders } = await import('@/lib/csrf');
    await fetch(`/api/orders/${orderId}/status`, { method: 'PATCH', headers: authHeaders(token || undefined), body: JSON.stringify({ status: 'delivered' }) });
    await loadOrders();
  }, [token, loadOrders]);

  useEffect(() => {
    loadOrders();
    let unsub: (() => void) | undefined;
    (async () => {
      const { subscribeOrders } = await import('@/lib/realtime');
      unsub = subscribeOrders(loadOrders);
    })();
    return () => { if (unsub) unsub(); };
  }, [loadOrders]);

  const ready = orders.filter(o => o.status === 'ready');
  const delivering = orders.filter(o => o.status === 'delivering');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-orange-500 text-white p-6">
        <h1 className="text-2xl font-bold">🛵 Portulu Rider</h1>
        <div className="mt-3">
          <button onClick={() => saveAvailability(!available)} className={`px-4 py-2 rounded-lg font-semibold ${available ? 'bg-green-600' : 'bg-gray-700'} text-white`}>
            {available ? 'Disponibile' : 'Non disponibile'}
          </button>
        </div>
      </div>
      <div className="p-4 max-w-2xl mx-auto">
        <h2 className="text-lg font-bold text-gray-800 mb-3">📦 Ordini pronti</h2>
        {ready.length === 0 && <div className="text-gray-500 mb-6">Nessun ordine pronto</div>}
        {ready.map(o => (
          <div key={o.id} className="bg-white rounded-xl shadow p-4 mb-3 flex items-center justify-between">
            <div>
              <div className="font-semibold">#{o.order_number}</div>
              <div className="text-sm text-gray-600">📍 {o.delivery_address} • {o.delivery_zone}</div>
            </div>
            <button onClick={() => takeOrder(o.id)} className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold">Ritira</button>
          </div>
        ))}

        <h2 className="text-lg font-bold text-gray-800 mb-3 mt-6">🚚 In consegna</h2>
        {delivering.length === 0 && <div className="text-gray-500">Nessun ordine in consegna</div>}
        {delivering.map(o => (
          <div key={o.id} className="bg-white rounded-xl shadow p-4 mb-3 flex items-center justify-between">
            <div>
              <div className="font-semibold">#{o.order_number}</div>
              <div className="text-sm text-gray-600">📍 {o.delivery_address} • {o.delivery_zone}</div>
            </div>
            <button onClick={() => completeOrder(o.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold">Completato</button>
          </div>
        ))}
      </div>
    </div>
  );
}


