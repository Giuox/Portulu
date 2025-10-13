const { useState, useEffect } = React;
const { MapPin, Clock, Check, X, RefreshCw } = lucide;

const RiderApp = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Dati mock per ora, poi puoi sostituire con fetch da backend
  useEffect(() => {
    setOrders([
      { id: 1, code: 'ORD1234', customer: 'Mario Rossi', address: 'Via Roma 12', zone: 'Centro', total: 25.50, status: 'ready', time: '12:35' },
      { id: 2, code: 'ORD1235', customer: 'Giulia Bianchi', address: 'Lungomare 45', zone: 'Sampieri', total: 32.00, status: 'delivering', time: '12:40' },
    ]);
  }, []);

  const acceptOrder = (orderId) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'delivering' } : o));
  };

  const completeOrder = (orderId) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'completed' } : o));
  };

  const refreshOrders = () => {
    // qui potresti fare fetch('/api/orders?rider=me') per aggiornare
    console.log('Aggiorno lista ordini...');
  };

  const OrderCard = ({ order }) => (
    <div className="bg-white rounded-xl shadow p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="font-bold text-gray-800">{order.code}</div>
        <div className={`text-xs px-2 py-1 rounded ${
          order.status === 'ready' ? 'bg-yellow-100 text-yellow-800' :
          order.status === 'delivering' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {order.status}
        </div>
      </div>
      <div className="flex items-center text-sm text-gray-600 mb-1">
        <MapPin size={16} className="mr-2" /> {order.address} ({order.zone})
      </div>
      <div className="flex items-center text-sm text-gray-600 mb-2">
        <Clock size={16} className="mr-2" /> {order.time}
      </div>
      <div className="font-semibold text-orange-500 mb-2">€{order.total.toFixed(2)}</div>
      {order.status === 'ready' && (
        <button onClick={() => acceptOrder(order.id)} className="bg-blue-500 text-white w-full py-2 rounded-lg">
          Accetta consegna
        </button>
      )}
      {order.status === 'delivering' && (
        <button onClick={() => completeOrder(order.id)} className="bg-green-500 text-white w-full py-2 rounded-lg">
          Consegna completata
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">🚴 Rider</h1>
        <button onClick={refreshOrders} className="text-orange-500">
          <RefreshCw size={20} />
        </button>
      </div>
      {orders.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">Nessun ordine disponibile</div>
      ) : (
        orders.map(order => <OrderCard key={order.id} order={order} />)
      )}
    </div>
  );
};

ReactDOM.render(<RiderApp />, document.getElementById('root'));
