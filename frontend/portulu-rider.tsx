import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Phone, Package, CheckCircle, Clock, DollarSign, TrendingUp, User, Menu, X, MessageCircle, AlertCircle } from 'lucide-react';

const RiderApp = () => {
  const [currentView, setCurrentView] = useState('deliveries');
  const [riderStatus, setRiderStatus] = useState('online');
  const [deliveries, setDeliveries] = useState([
    {
      id: 'DEL001',
      orderId: 'ORD001',
      status: 'assigned',
      restaurant: {
        name: 'Antica Trattoria Siciliana',
        address: 'Via Mormino Penna 12, Scicli',
        phone: '+39 0932 841234',
        coordinates: { lat: 36.7894, lng: 14.9032 }
      },
      customer: {
        name: 'Mario Rossi',
        address: 'Via Roma 45, Scicli Centro',
        phone: '+39 333 1234567',
        coordinates: { lat: 36.7912, lng: 14.9056 }
      },
      items: [
        { name: 'Pasta alla Norma', quantity: 2 },
        { name: 'Arancini Ragusani', quantity: 3 }
      ],
      total: 36,
      deliveryFee: 0,
      paymentMethod: 'Contanti',
      zone: 'Scicli Centro',
      distance: '1.2 km',
      estimatedTime: '8 min',
      pickupTime: '15:20',
      notes: 'Citofono al secondo piano'
    },
    {
      id: 'DEL002',
      orderId: 'ORD002',
      status: 'picked_up',
      restaurant: {
        name: 'Pizzeria Da Nino',
        address: 'Corso Mazzini 89, Scicli',
        phone: '+39 0932 845678',
        coordinates: { lat: 36.7901, lng: 14.9045 }
      },
      customer: {
        name: 'Giuseppe Battaglia',
        address: 'Lungomare Mediterraneo 12, Sampieri',
        phone: '+39 345 9876543',
        coordinates: { lat: 36.7234, lng: 14.9567 }
      },
      items: [
        { name: 'Margherita', quantity: 2 },
        { name: 'Diavola', quantity: 1 }
      ],
      total: 23,
      deliveryFee: 3,
      paymentMethod: 'Carta',
      zone: 'Sampieri',
      distance: '8.5 km',
      estimatedTime: '12 min',
      pickupTime: '15:15',
      notes: ''
    }
  ]);

  const [earnings, setEarnings] = useState({
    today: 45.50,
    week: 234.80,
    deliveriesToday: 12,
    deliveriesWeek: 67
  });

  const [showMenu, setShowMenu] = useState(false);

  const riderInfo = {
    name: 'Luca Messina',
    rating: 4.9,
    totalDeliveries: 456
  };

  const updateDeliveryStatus = (deliveryId, newStatus) => {
    setDeliveries(deliveries.map(delivery =>
      delivery.id === deliveryId ? { ...delivery, status: newStatus } : delivery
    ));

    if (newStatus === 'delivered') {
      const delivery = deliveries.find(d => d.id === deliveryId);
      setEarnings(prev => ({
        ...prev,
        today: prev.today + delivery.deliveryFee,
        deliveriesToday: prev.deliveriesToday + 1
      }));
    }
  };

  const openNavigation = (coordinates) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
    window.open(url, '_blank');
  };

  const callPhone = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      assigned: 'bg-blue-100 text-blue-700 border-blue-300',
      picked_up: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      delivering: 'bg-orange-100 text-orange-700 border-orange-300',
      delivered: 'bg-green-100 text-green-700 border-green-300'
    };
    return colors[status] || colors.assigned;
  };

  const getStatusLabel = (status) => {
    const labels = {
      assigned: 'Da Ritirare',
      picked_up: 'Ritirato',
      delivering: 'In Consegna',
      delivered: 'Consegnato'
    };
    return labels[status] || status;
  };

  const getNextAction = (status) => {
    const actions = {
      assigned: { label: 'Ritirato', nextStatus: 'picked_up', icon: Package },
      picked_up: { label: 'In Consegna', nextStatus: 'delivering', icon: Navigation },
      delivering: { label: 'Consegnato', nextStatus: 'delivered', icon: CheckCircle }
    };
    return actions[status];
  };

  const DeliveriesView = () => {
    const activeDeliveries = deliveries.filter(d => d.status !== 'delivered');
    const completedDeliveries = deliveries.filter(d => d.status === 'delivered');

    const DeliveryCard = ({ delivery }) => {
      const nextAction = getNextAction(delivery.status);
      const isPickup = delivery.status === 'assigned';
      const location = isPickup ? delivery.restaurant : delivery.customer;
      const ActionIcon = nextAction?.icon;

      return (
        <div className="bg-white rounded-xl shadow-md p-4 mb-3 border-l-4 border-orange-500">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-lg">#{delivery.orderId}</span>
                <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(delivery.status)}`}>
                  {getStatusLabel(delivery.status)}
                </span>
              </div>
              <div className="text-sm text-gray-600">{delivery.zone} • {delivery.distance}</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-orange-500">€{delivery.total.toFixed(2)}</div>
              <div className="text-xs text-gray-500">{delivery.paymentMethod}</div>
              {delivery.deliveryFee > 0 && (
                <div className="text-xs text-green-600 font-semibold mt-1">
                  +€{delivery.deliveryFee.toFixed(2)} guadagno
                </div>
              )}
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-3 mb-3">
            <div className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              {isPickup ? '🏪 Ritira da:' : '📦 Consegna a:'}
            </div>
            <div className="text-sm">
              <div className="font-semibold text-gray-800">{location.name}</div>
              <div className="text-gray-600 mt-1">📍 {location.address}</div>
              <div className="text-gray-600">📞 {location.phone}</div>
              {delivery.notes && !isPickup && (
                <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200 flex items-start gap-2">
                  <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-yellow-800">{delivery.notes}</span>
                </div>
              )}
            </div>
          </div>

          {!isPickup && (
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <div className="text-sm font-semibold text-gray-700 mb-2">Articoli:</div>
              {delivery.items.map((item, idx) => (
                <div key={idx} className="text-sm text-gray-600">
                  • {item.quantity}x {item.name}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => openNavigation(location.coordinates)}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Navigation size={18} />
              Naviga
            </button>
            <button
              onClick={() => callPhone(location.phone)}
              className="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Phone size={18} />
            </button>
          </div>

          {nextAction && (
            <button
              onClick={() => updateDeliveryStatus(delivery.id, nextAction.nextStatus)}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {ActionIcon && <ActionIcon size={18} />}
              {nextAction.label}
            </button>
          )}

          <div className="flex items-center justify-center gap-4 mt-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              {isPickup ? `Ritiro: ${delivery.pickupTime}` : `ETA: ${delivery.estimatedTime}`}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div>
        {activeDeliveries.length > 0 ? (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Package className="text-orange-500" size={20} />
              Consegne Attive ({activeDeliveries.length})
            </h2>
            {activeDeliveries.map(delivery => (
              <DeliveryCard key={delivery.id} delivery={delivery} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-md mb-6">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold">Nessuna consegna attiva</p>
            <p className="text-sm mt-1">Le nuove consegne appariranno qui</p>
          </div>
        )}

        {completedDeliveries.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <CheckCircle className="text-green-500" size={20} />
              Completate Oggi ({completedDeliveries.length})
            </h2>
            {completedDeliveries.map(delivery => (
              <div key={delivery.id} className="bg-white rounded-lg shadow-sm p-4 mb-2 opacity-75">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-gray-700">#{delivery.orderId}</span>
                    <span className="text-sm text-gray-500 ml-2">{delivery.zone}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 font-semibold">€{delivery.deliveryFee.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">✓ Consegnato</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const EarningsView = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Guadagni Oggi</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-500">€{earnings.today.toFixed(2)}</div>
            <div className="text-sm text-gray-600 mt-1">Incassato</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500">{earnings.deliveriesToday}</div>
            <div className="text-sm text-gray-600 mt-1">Consegne</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t text-center">
          <div className="text-sm text-gray-600">Media per consegna</div>
          <div className="text-2xl font-bold text-blue-500 mt-1">
            €{earnings.deliveriesToday > 0 ? (earnings.today / earnings.deliveriesToday).toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Questa Settimana</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-500">€{earnings.week.toFixed(2)}</div>
            <div className="text-sm text-gray-600 mt-1">Incassato</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500">{earnings.deliveriesWeek}</div>
            <div className="text-sm text-gray-600 mt-1">Consegne</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t text-center">
          <div className="text-sm text-gray-600">Media per consegna</div>
          <div className="text-2xl font-bold text-blue-500 mt-1">
            €{earnings.deliveriesWeek > 0 ? (earnings.week / earnings.deliveriesWeek).toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Statistiche Totali</h2>
          <TrendingUp size={24} />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-orange-100">Rating</span>
            <span className="font-bold text-2xl">⭐ {riderInfo.rating}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-orange-100">Consegne Totali</span>
            <span className="font-bold text-2xl">{riderInfo.totalDeliveries}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Obiettivi Settimanali</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Consegne (67/80)</span>
              <span className="text-gray-700 font-semibold">84%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '84%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Guadagno (€234/€300)</span>
              <span className="text-gray-700 font-semibold">78%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20">
      <div className="bg-orange-500 text-white p-6 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Portulu Rider</h1>
            <p className="text-orange-100 text-sm">{riderInfo.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRiderStatus(riderStatus === 'online' ? 'offline' : 'online')}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                riderStatus === 'online'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-500 hover:bg-gray-600'
              }`}
            >
              {riderStatus === 'online' ? '🟢 Online' : '⚫ Offline'}
            </button>
            <button onClick={() => setShowMenu(!showMenu)}>
              <User size={24} />
            </button>
          </div>
        </div>

        <div className="bg-orange-600 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-sm text-orange-100">Guadagno Oggi</div>
            <div className="text-2xl font-bold">€{earnings.today.toFixed(2)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-orange-100">Consegne</div>
            <div className="text-2xl font-bold">{earnings.deliveriesToday}</div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md sticky top-36 z-10">
        <div className="flex">
          <button
            onClick={() => setCurrentView('deliveries')}
            className={`flex-1 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
              currentView === 'deliveries'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Package size={20} />
            Consegne
          </button>
          <button
            onClick={() => setCurrentView('earnings')}
            className={`flex-1 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
              currentView === 'earnings'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <DollarSign size={20} />
            Guadagni
          </button>
        </div>
      </div>

      <div className="p-4">
        {currentView === 'deliveries' && <DeliveriesView />}
        {currentView === 'earnings' && <EarningsView />}
      </div>

      {riderStatus === 'offline' && (
        <div className="fixed bottom-0 left-0 right-0 bg-red-500 text-white p-4 text-center font-semibold shadow-lg">
          ⚠️ Sei Offline - Non riceverai nuove consegne
        </div>
      )}
    </div>
  );
};

export default RiderApp;