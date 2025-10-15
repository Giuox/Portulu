"use client";
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('portulu_token') : null;
  const [orders, setOrders] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  async function loadData() {
    if (!token) { window.location.href = '/(auth)/login'; return; }
    const [ordersRes, restaurantsRes] = await Promise.all([
      fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/restaurants')
    ]);
    const orders = await ordersRes.json();
    const restaurants = await restaurantsRes.json();
    setOrders(ordersRes.ok ? orders : []);
    setRestaurants(restaurantsRes.ok ? restaurants : []);

      // Load profiles to derive riders
      const profilesRes = await fetch('/api/admin/profiles', { headers: { Authorization: `Bearer ${token}` } });
      const profilesJson = profilesRes.ok ? ((await profilesRes.json()) as Profile[]) : [];
      setRiders(profilesJson.filter((p) => p.role === 'rider'));
    })();
  }, [token]);

  const inProgress = orders.filter((o) => ['new','preparing','ready','delivering'].includes(o.status));
  const completedToday = orders.filter((o) => o.status === 'delivered');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🛠️ Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-sm text-gray-500">Ordini attivi</div>
            <div className="text-3xl font-bold">{inProgress.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-sm text-gray-500">Completati oggi</div>
            <div className="text-3xl font-bold">{completedToday.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-sm text-gray-500">Rider disponibili</div>
            <div className="text-3xl font-bold">{riders.filter(r => r.rider_available).length}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold mb-3">📦 Ordini recenti</h2>
            <div className="space-y-2 max-h-[400px] overflow-auto">
              {orders.slice(0, 20).map((o: Order) => (
                <div key={o.id} className="flex items-center justify-between border-b pb-2">
                  <div>#{o.order_number} • {o.status}</div>
                  <div className="text-sm text-gray-600">€{Number(o.total).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold mb-3">🍽️ Ristoranti</h2>
            <ul className="space-y-2 max-h-[400px] overflow-auto">
              {restaurants.map((r: Restaurant) => (
                <li key={r.id} className="flex items-center justify-between border-b pb-2">
                  <div>{r.name}</div>
                  <div className="text-sm text-gray-600">Min €{Number(r.min_order || 0).toFixed(2)}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


