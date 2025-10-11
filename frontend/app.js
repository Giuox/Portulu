// Usa React globale (UMD) e Lucide globale
const { useState, useEffect } = React;
const { ShoppingCart, MapPin, Clock, Star, Search, User, ChevronRight } = lucide;

const PortuluApp = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedZone, setSelectedZone] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);

  // Dati mock - Zone
  const zones = [
    { id: 'centro', name: 'Scicli Centro', fee: 0 },
    { id: 'sampieri', name: 'Sampieri', fee: 3 },
    { id: 'donnalucata', name: 'Donnalucata', fee: 3 },
    { id: 'cava', name: "Cava d'Aliga", fee: 3.5 },
    { id: 'playa', name: 'Playa Grande', fee: 2.5 }
  ];

  // Dati mock - Ristoranti
  const restaurants = [
    {
      id: 1,
      name: 'Antica Trattoria Siciliana',
      category: 'Siciliano',
      rating: 4.8,
      reviews: 127,
      deliveryTime: '30-40 min',
      minOrder: 15,
      image: '🍝',
      zones: ['centro', 'sampieri', 'donnalucata'],
      menu: [
        { id: 1, name: 'Pasta alla Norma', price: 12, category: 'Primi' },
        { id: 2, name: 'Arancini Ragusani', price: 4, category: 'Antipasti' },
        { id: 3, name: 'Caponata Siciliana', price: 8, category: 'Antipasti' },
        { id: 4, name: 'Cannolo Siciliano', price: 5, category: 'Dolci' }
      ]
    },
    {
      id: 2,
      name: 'Pizzeria Da Nino',
      category: 'Pizza',
      rating: 4.6,
      reviews: 89,
      deliveryTime: '25-35 min',
      minOrder: 10,
      image: '🍕',
      zones: ['centro', 'playa'],
      menu: [
        { id: 5, name: 'Margherita', price: 7, category: 'Pizza' },
        { id: 6, name: 'Diavola', price: 9, category: 'Pizza' },
        { id: 7, name: 'Quattro Formaggi', price: 10, category: 'Pizza' }
      ]
    },
    {
      id: 3,
      name: 'Pescheria Del Mare',
      category: 'Pesce',
      rating: 4.9,
      reviews: 156,
      deliveryTime: '40-50 min',
      minOrder: 25,
      image: '🐟',
      zones: ['centro', 'sampieri', 'donnalucata', 'cava'],
      menu: [
        { id: 8, name: 'Spaghetti allo Scoglio', price: 18, category: 'Primi' },
        { id: 9, name: 'Frittura Mista', price: 16, category: 'Secondi' },
        { id: 10, name: 'Gamberoni alla Griglia', price: 22, category: 'Secondi' }
      ]
    }
  ];

  const filteredRestaurants = restaurants.filter(r =>
    !selectedZone || r.zones.includes(selectedZone)
  ).filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (item) => {
    const existingItem = cart.find(i => i.id === item.id);
    if (existingItem) {
      setCart(cart.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1, restaurantId: selectedRestaurant.id }]);
    }
  };

  const removeFromCart = (itemId) => {
    const item = cart.find(i => i.id === itemId);
    if (item.quantity > 1) {
      setCart(cart.map(i =>
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      ));
    } else {
      setCart(cart.filter(i => i.id !== itemId));
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = zones.find(z => z.id === selectedZone)?.fee || 0;
  const totalWithDelivery = cartTotal + deliveryFee;

  const placeOrder = () => {
    setOrderStatus({
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      status: 'confirmed',
      restaurant: selectedRestaurant.name,
      items: cart,
      total: totalWithDelivery,
      estimatedTime: selectedRestaurant.deliveryTime
    });
    setCart([]);
    setCurrentView('tracking');
  };

  // Componenti View semplificate
  const ZoneSelectionView = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-orange-500 text-white p-6 pb-24 rounded-b-3xl">
        <h1 className="text-3xl font-bold mb-2">Portulu</h1>
        <p className="text-orange-100">U megghiu delivery di Sicilia</p>
      </div>
      <div className="px-4 -mt-16">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="space-y-3">
            {zones.map(zone => (
              <button
                key={zone.id}
                onClick={() => { setSelectedZone(zone.id); setCurrentView('home'); }}
                className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center justify-between"
              >
                <div className="text-left">
                  <div className="font-semibold text-gray-800">{zone.name}</div>
                  <div className="text-sm text-gray-500">
                    Consegna: {zone.fee === 0 ? 'Gratis' : `€${zone.fee.toFixed(2)}`}
                  </div>
                </div>
                <ChevronRight size={20} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const HomeView = () => (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-orange-500 text-white p-6 sticky top-0 z-10">
        <h1 className="text-2xl font-bold">Portulu</h1>
      </div>
      <div className="p-4 space-y-4">
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Nessun ristorante disponibile</div>
        ) : (
          filteredRestaurants.map(r => (
            <button key={r.id} onClick={() => { setSelectedRestaurant(r); setCurrentView('menu'); }}
              className="w-full bg-white rounded-2xl shadow-md p-4 flex items-center gap-4">
              <div className="text-4xl">{r.image}</div>
              <div>
                <h3 className="font-bold text-gray-800">{r.name}</h3>
                <p className="text-sm text-gray-500">{r.category}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  const MenuView = () => (
    <div className="min-h-screen bg-gray-50 p-4">
      <button onClick={() => setCurrentView('home')} className="mb-4 text-orange-500">← Indietro</button>
      <h2 className="text-lg font-bold mb-4">{selectedRestaurant?.name}</h2>
      {selectedRestaurant?.menu.map(item => (
        <div key={item.id} className="bg-white p-4 rounded-xl mb-3 flex justify-between items-center">
          <div>
            <div>{item.name}</div>
            <div className="text-orange-500 font-bold">€{item.price.toFixed(2)}</div>
          </div>
          <button onClick={() => addToCart(item)} className="bg-orange-500 text-white px-3 py-1 rounded-lg">Aggiungi</button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl min-h-screen">
      {!selectedZone && currentView === 'home' && <ZoneSelectionView />}
      {selectedZone && currentView === 'home' && <HomeView />}
      {currentView === 'menu' && <MenuView />}
    </div>
  );
};

// Render
ReactDOM.render(<PortuluApp />, document.getElementById('root'));
