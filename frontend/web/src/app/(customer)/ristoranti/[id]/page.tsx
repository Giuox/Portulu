"use client";
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

type MenuItem = { id: number; name: string; price: number; category: string };
type Zone = { name: string; delivery_fee: number };

export default function RestaurantMenuPage() {
  const params = useParams<{ id: string }>();
  const restaurantId = Number(params.id);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<{ id: number; name: string; price: number; quantity: number }[]>([]);
  const token = typeof window !== 'undefined' ? localStorage.getItem('portulu_token') : null;

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/restaurants/${restaurantId}/menu`);
      const data = (await res.json()) as MenuItem[];
      if (!res.ok) { console.error((data as unknown as { error?: string })?.error); return; }
      setItems(data);
    })();
  }, [restaurantId]);

  function addToCart(i: MenuItem) {
    setCart(prev => {
      const found = prev.find(p => p.id === i.id);
      if (found) return prev.map(p => p.id === i.id ? { ...p, quantity: p.quantity + 1 } : p);
      return [...prev, { id: i.id, name: i.name, price: i.price, quantity: 1 }];
    });
  }
  function removeFromCart(id: number) {
    setCart(prev => prev.flatMap(p => p.id !== id ? [p] : (p.quantity > 1 ? [{ ...p, quantity: p.quantity - 1 }] : [])));
  }

  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);
  const [deliveryZone] = useState<string>('Scicli Centro');
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  useEffect(() => {
    // Fetch zone to compute fee
    fetch('/api/zones').then(r => r.json()).then((zones: Zone[]) => {
      const z = zones.find((z) => z.name === deliveryZone);
      setDeliveryFee(z ? Number(z.delivery_fee) : 0);
    });
  }, [deliveryZone]);

  async function placeOrder() {
    if (!token) { window.location.href = '/(auth)/login'; return; }
    const body = {
      restaurant_id: restaurantId,
      items: cart.map(c => ({ id: c.id, name: c.name, price: c.price, quantity: c.quantity })),
      subtotal,
      delivery_fee: deliveryFee,
      total: subtotal + deliveryFee,
      payment_method: 'cash',
      delivery_address: 'Indirizzo utente',
      delivery_zone: deliveryZone,
      customer_phone: '+39 333 0000000',
      customer_name: 'Cliente',
      notes: ''
    };
    const { authHeaders } = await import('@/lib/csrf');
    const res = await fetch('/api/orders', { method: 'POST', headers: authHeaders(token || undefined), body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { alert(data.error || 'Errore ordine'); return; }
    window.location.href = `/tracking/${encodeURIComponent(data.orderNumber)}`;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-xl mx-auto">
      <button onClick={() => history.back()} className="mb-4 text-orange-500">← Indietro</button>
      <h2 className="text-lg font-bold mb-4">Menu</h2>
      {items.map(i => (
        <div key={i.id} className="bg-white p-4 rounded-xl mb-3 flex justify-between items-center">
          <div>
            <div>{i.name}</div>
            <div className="text-orange-500 font-bold">€{Number(i.price).toFixed(2)}</div>
          </div>
          <button onClick={() => addToCart(i)} className="bg-orange-500 text-white px-3 py-1 rounded-lg">Aggiungi</button>
        </div>
      ))}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Carrello</div>
            <div className="text-sm text-gray-500">Totale articoli: {cart.reduce((s, i) => s + i.quantity, 0)}</div>
          </div>
          {cart.map(c => (
            <div key={c.id} className="flex items-center justify-between mb-2">
              <div>{c.name} x{c.quantity}</div>
              <div className="flex items-center gap-2">
                <button onClick={() => removeFromCart(c.id)} className="px-2 py-1 rounded bg-gray-100">-</button>
                <button onClick={() => addToCart({ id: c.id, name: c.name, price: c.price, category: '' })} className="px-2 py-1 rounded bg-gray-100">+</button>
                <div className="font-semibold">€{(c.price * c.quantity).toFixed(2)}</div>
              </div>
            </div>
          ))}
          <div className="text-sm text-gray-600 mt-2">Consegna: €{deliveryFee.toFixed(2)}</div>
          <div className="font-bold text-xl mt-1">Totale: €{(subtotal + deliveryFee).toFixed(2)}</div>
          <button onClick={placeOrder} disabled={cart.length === 0} className="w-full mt-3 bg-orange-500 text-white px-4 py-3 rounded-lg font-semibold disabled:opacity-50">Conferma Ordine</button>
        </div>
      </div>
    </div>
  );
}


