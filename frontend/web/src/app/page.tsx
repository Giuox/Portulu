"use client";
import { useEffect, useState } from "react";

type Zone = { id: number; name: string; delivery_fee: number };
type Restaurant = { id: number; name: string; category: string; delivery_time: string };

export default function Home() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/zones").then(r => r.json()).then(setZones).catch(() => setZones([]));
  }, []);

  async function selectZone(zoneName: string) {
    setSelectedZone(zoneName);
    setLoading(true);
    try {
      const res = await fetch(`/api/restaurants?zone=${encodeURIComponent(zoneName)}`);
      const data = await res.json();
      setRestaurants(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen max-w-xl mx-auto bg-gray-50">
      {!selectedZone ? (
        <div>
          <div className="bg-orange-500 text-white p-6 pb-24 rounded-b-3xl">
            <h1 className="text-3xl font-bold mb-2">Portulu</h1>
            <p className="text-orange-100">U megghiu delivery di Sicilia</p>
          </div>
          <div className="px-4 -mt-16">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="space-y-3">
                {zones.map((z) => (
                  <button
                    key={z.id}
                    onClick={() => selectZone(z.name)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center justify-between"
                  >
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">{z.name}</div>
                      <div className="text-sm text-gray-500">
                        Consegna: {z.delivery_fee === 0 ? "Gratis" : `€${z.delivery_fee.toFixed(2)}`}
                      </div>
                    </div>
                    <span>→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-orange-500 text-white p-6">
            <button onClick={() => { setSelectedZone(""); setRestaurants([]); }} className="mb-4 text-orange-100 hover:text-white">
              ← Indietro
            </button>
            <h1 className="text-2xl font-bold">Portulu</h1>
            <p className="text-orange-100 text-sm">📍 {selectedZone}</p>
          </div>

          <div className="p-4 space-y-4">
            {loading && <p className="text-center py-12 text-gray-500">Caricamento ristoranti...</p>}
            {!loading && restaurants.length === 0 && (
              <div className="text-center py-12 text-gray-500">Nessun ristorante disponibile</div>
            )}
            {restaurants.map((r) => (
              <a href={`/ristoranti/${r.id}`} key={r.id} className="block bg-white rounded-2xl shadow-md p-4">
                <div className="flex items-start gap-4">
                  <div className="text-5xl">🍽️</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800">{r.name}</h3>
                    <p className="text-sm text-gray-500">{r.category}</p>
                    <div className="text-gray-600 text-sm mt-1">⏱️ {r.delivery_time}</div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
