"use client";
import { useCallback, useEffect, useState } from 'react';

type Order = {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_zone: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: 'new'|'preparing'|'ready'|'delivering'|'delivered'|'cancelled';
  payment_method: string | null;
  notes: string | null;
  created_at: string;
};

export default function RistorantePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('portulu_token') : null;

  const loadOrders = useCallback(async () => {
    if (!token) { window.location.href = '/login'; return; }
    setLoading(true);
    try {
      const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore caricamento ordini');
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  async function updateOrderStatus(id: number, status: Order['status']) {
    if (!token) return;
    const { authHeaders } = await import('@/lib/csrf');
    const res = await fetch(`/api/orders/${id}/status`, { method: 'PATCH', headers: authHeaders(token || undefined), body: JSON.stringify({ status }) });
    const data = await res.json();
    if (!res.ok) { alert(data.error || 'Errore aggiornamento'); return; }
    await loadOrders();
  }

  useEffect(() => {
    loadOrders();
    let unsub: (() => void) | undefined;
    (async () => {
      const { subscribeOrders } = await import('@/lib/realtime');
      unsub = subscribeOrders(loadOrders);
    })();
    return () => { if (unsub) unsub(); };
  }, [loadOrders]);

  const newOrders = orders.filter(o => o.status === 'new');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-orange-500 text-white p-6 sticky top-0 z-10 shadow-lg">
        <h1 className="text-2xl font-bold">🍽️ Portulu</h1>
        <p className="text-orange-100 text-sm">Dashboard Ristoratore</p>
      </div>
      <div className="p-4 pb-8 max-w-3xl mx-auto">
        {loading && <div className="text-center py-8 text-gray-500">Caricamento...</div>}
        {!loading && (
          <div>
            {newOrders.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3">🔔 Nuovi Ordini</h2>
                {newOrders.map(order => (
                  <OrderCard key={order.id} order={order} onUpdate={updateOrderStatus} />
                ))}
              </section>
            )}
            {preparingOrders.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3">👨‍🍳 In Preparazione</h2>
                {preparingOrders.map(order => (
                  <OrderCard key={order.id} order={order} onUpdate={updateOrderStatus} />
                ))}
              </section>
            )}
            {readyOrders.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3">📦 Pronti per il Ritiro</h2>
                {readyOrders.map(order => (
                  <OrderCard key={order.id} order={order} onUpdate={updateOrderStatus} />
                ))}
              </section>
            )}
            {orders.length === 0 && (
              <div className="text-center py-12 text-gray-500">Nessun ordine attivo</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, onUpdate }: { order: Order; onUpdate: (id: number, s: Order['status']) => void }) {
  const timeAgo = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000);
  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-3 border-l-4 border-orange-500">
      <div className="flex justify-between mb-3">
        <div>
          <span className="font-bold text-lg">#{order.order_number}</span>
          <span className="ml-2 text-xs text-gray-500">{timeAgo}m fa</span>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-orange-500">€{order.total.toFixed(2)}</div>
          <div className="text-xs text-gray-500">{order.payment_method || ''}</div>
        </div>
      </div>
      <div className="border-t pt-3 mb-3">
        <div className="font-semibold text-gray-800 mb-1">{order.customer_name}</div>
        <div className="text-sm text-gray-600">📍 {order.delivery_address}</div>
        <div className="text-sm text-gray-600 mt-1">📞 {order.customer_phone}</div>
        <div className="text-xs text-gray-500 mt-1">Zona: {order.delivery_zone}</div>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <div className="font-semibold text-sm text-gray-700 mb-2">Articoli:</div>
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">{item.quantity}x {item.name}</span>
            <span className="font-semibold text-gray-800">€{(item.quantity * item.price).toFixed(2)}</span>
          </div>
        ))}
      </div>
      {order.notes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 text-sm">
          <span className="font-semibold text-yellow-800">📝 Note:</span>
          <span className="text-yellow-700"> {order.notes}</span>
        </div>
      )}
      <div className="flex gap-2">
        {order.status === 'new' && (
          <>
            <button onClick={() => onUpdate(order.id, 'preparing')} className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600">✓ Accetta Ordine</button>
            <button onClick={() => onUpdate(order.id, 'cancelled')} className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600">✗ Rifiuta</button>
          </>
        )}
        {order.status === 'preparing' && (
          <button onClick={() => onUpdate(order.id, 'ready')} className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600">📦 Segna come Pronto</button>
        )}
        {order.status === 'ready' && (
          <div className="w-full bg-green-100 border-2 border-green-300 text-green-700 py-3 rounded-lg text-center font-semibold">✓ In attesa del Rider</div>
        )}
      </div>
    </div>
  );
}


