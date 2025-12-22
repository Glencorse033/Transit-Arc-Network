import React, { useState, useEffect } from 'react';
import { generateRoutes } from '../services/geminiService.ts';
import { TransitRoute, Ticket, PaymentLink, WalletState } from '../types.ts';
import { TicketCard } from './TicketCard.tsx';
import { MapPin, Bus, Train, Ship, Share2, ArrowRight, Wallet, Check, Copy, Clock, Loader2, ArrowLeft, Search, MessageSquare } from 'lucide-react';

interface Props {
  walletState: WalletState;
  onUpdateWallet: (newBalance: number) => void;
  onCreateLink: (link: PaymentLink) => void;
  onJoinChat: (route: TransitRoute) => void;
}

export const PassengerDashboard: React.FC<Props> = ({ walletState, onUpdateWallet, onCreateLink, onJoinChat }) => {
  const [routes, setRoutes] = useState<TransitRoute[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [city, setCity] = useState("San Francisco");
  const [selectedRoute, setSelectedRoute] = useState<TransitRoute | null>(null);
  const [paymentMode, setPaymentMode] = useState<'SELF' | 'LINK'>('SELF');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [passengerName, setPassengerName] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchRoutes(city); }, []);

  const fetchRoutes = async (cityName: string) => {
    setLoadingRoutes(true);
    const result = await generateRoutes(cityName);
    setRoutes(result);
    setLoadingRoutes(false);
  };

  const handlePaySelf = () => {
    if (!walletState.isConnected || walletState.balance < (selectedRoute?.price || 0)) return;
    setProcessing(true);
    setTimeout(() => {
      onUpdateWallet(walletState.balance - (selectedRoute!.price));
      const newTicket: Ticket = {
        id: Math.random().toString(36).substr(2, 9),
        routeId: selectedRoute!.id,
        routeName: selectedRoute!.name,
        passengerName: passengerName || "Self",
        status: 'ACTIVE',
        purchaseDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 3600 * 2000).toISOString(),
        qrData: `TRANSIT-ARC:${selectedRoute!.id}`,
        txHash: '0x' + Math.random().toString(16).slice(2),
        imageUrl: selectedRoute!.imageUrl
      };
      setTickets([newTicket, ...tickets]);
      setSelectedRoute(null);
      setProcessing(false);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {!selectedRoute ? (
          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
              <div className="flex gap-2 mb-6">
                  <input value={city} onChange={(e) => setCity(e.target.value)} className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-2 text-sm" />
                  <button onClick={() => fetchRoutes(city)} className="bg-white text-black px-4 py-2 rounded-xl text-sm font-bold">Search</button>
              </div>
              <div className="space-y-4">
                  {routes.map(r => (
                      <div key={r.id} className="p-4 bg-black border border-zinc-800 rounded-xl flex justify-between items-center">
                          <div>
                              <h4 className="font-bold">{r.name}</h4>
                              <p className="text-xs text-zinc-500">{r.origin} → {r.destination}</p>
                          </div>
                          <button onClick={() => setSelectedRoute(r)} className="bg-zinc-800 px-3 py-1.5 rounded-lg text-xs font-bold">Book {r.price} USDC</button>
                      </div>
                  ))}
              </div>
          </div>
      ) : (
          <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
              <button onClick={() => setSelectedRoute(null)} className="text-sm text-zinc-500 mb-4">← Back</button>
              <h3 className="text-2xl font-bold mb-4">{selectedRoute.name}</h3>
              <input value={passengerName} onChange={(e) => setPassengerName(e.target.value)} placeholder="Passenger Name" className="w-full bg-black border border-zinc-800 rounded-xl p-4 mb-4" />
              <button onClick={handlePaySelf} disabled={processing} className="w-full bg-white text-black font-bold py-4 rounded-xl">
                  {processing ? 'Processing...' : 'Confirm Ticket'}
              </button>
          </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map(t => <TicketCard key={t.id} ticket={t} />)}
      </div>
    </div>
  );
};