"use client";
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type Order = { id: number; order_number: string; status: string };

export default function TrackingPage() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = params.orderNumber;
  const token = typeof window !== 'undefined' ? localStorage.getItem('portulu_token') : null;
  const [order, setOrder] = useState<Order | null>(null);

  const loadOrders = useCallback(async () => {
    if (!token) { window.location.href = '/(auth)/login'; return; }
    const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) return;
    const found = (data as Order[]).find((o) => o.order_number === orderNumber);
    if (found) setOrder(found);
  }, [token, orderNumber]);

  useEffect(() => {
    loadOrders();
    (async () => {
      const { subscribeOrders } = await import('@/lib/realtime');
      const unsub = subscribeOrders(loadOrders);
      const t = setInterval(loadOrders, 15000); // fallback polling
      return () => { unsub(); clearInterval(t); };
    })();
  }, [orderNumber, loadOrders]);

  if (!order) return <div className="min-h-screen flex items-center justify-center">Ordine non trovato</div>;

  const steps = ['new','preparing','ready','delivering','delivered'];
  const currentIndex = steps.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold mb-4">Tracking Ordine #{order.order_number}</h1>
        <ol className="space-y-3">
          {steps.map((s, i) => (
            <li key={s} className={`p-3 rounded-lg border ${i <= currentIndex ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
              {s === 'new' && 'Ricevuto'}
              {s === 'preparing' && 'In preparazione'}
              {s === 'ready' && 'Pronto per il ritiro'}
              {s === 'delivering' && 'In consegna'}
              {s === 'delivered' && 'Completato'}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}


