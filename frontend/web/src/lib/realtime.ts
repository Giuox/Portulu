import { supabase } from '@/lib/supabaseClient';

export function subscribeOrders(onChange: () => void) {
  // Listen to inserts/updates on orders table
  const channel = supabase
    .channel('orders-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
      onChange();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}


