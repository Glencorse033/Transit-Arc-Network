import React, { useState, useEffect } from 'react';
import { generateRoutes } from '../services/geminiService.ts';
import { TransitRoute, Ticket, PaymentLink, WalletState } from '../types.ts';
import { TicketCard } from './TicketCard.tsx';
import { 
  MapPin, Bus, Train, Ship, Share2, ArrowRight, Wallet, 
  Check, Copy, Clock, Loader2, ArrowLeft, Search, 
  MessageSquare, Users, Sparkles, Map as MapIcon 
} from 'lucide-react';

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

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'TRAIN': return <Train size={16} />;
      case 'METRO': return <Train size={16} />;
      case 'FERRY': return <Ship size={16} />;
      default: return <Bus size={16} />;
    }
  };

  return (
    <div className="space-y-8 md:space-y-12">
      {/* City Search Bar */}
      {!selectedRoute && (
        <div className="relative group w-full max-w-xl mx-auto">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-indigo-500 transition-colors">
            <Search size={18} />
          </div>
          <input 
            value={city} 
            onChange={(e) => setCity(e.target.value)} 
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-11 pr-24 md:pr-32 py-3.5 md:py-4 text-sm md:text-lg font-medium shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            placeholder="Search city..."
            onKeyDown={(e) => e.key === 'Enter' && fetchRoutes(city)}
          />
          <button 
            onClick={() => fetchRoutes(city)} 
            disabled={loadingRoutes}
            className="absolute right-1.5 inset-y-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black px-4 md:px-6 rounded-xl text-xs md:text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loadingRoutes ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
          </button>
        </div>
      )}

      {!selectedRoute ? (
        <div className="space-y-6 md:space-y-8">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
              <MapIcon size={18} className="text-indigo-500" />
              Routes in {city}
            </h2>
            <div className="text-[10px] md:text-xs font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2 md:px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800">
              {routes.length} LOADED
            </div>
          </div>

          {loadingRoutes ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-56 md:h-64 rounded-3xl bg-zinc-100 dark:bg-zinc-900 animate-pulse border border-zinc-200 dark:border-zinc-800" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {routes.map(r => (
                <div key={r.id} className="group relative bg-white dark:bg-zinc-950 rounded-2xl md:rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-indigo-500/50 transition-all duration-300 shadow-sm hover:shadow-xl">
                  {/* Destination Image Background */}
                  <div className="h-40 md:h-44 w-full relative overflow-hidden">
                    <img src={r.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={r.destination} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    
                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <div className="bg-white/10 backdrop-blur-md text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-white/10">
                        {getTransportIcon(r.type)}
                        {r.type}
                      </div>
                    </div>
                    
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-zinc-300 text-[9px] md:text-[10px] uppercase tracking-widest font-bold truncate">{r.origin} → {r.destination}</p>
                      <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">{r.name}</h3>
                    </div>
                  </div>

                  <div className="p-4 md:p-5 flex items-center justify-between bg-white dark:bg-zinc-900/50">
                    <div className="flex flex-col">
                       <span className="text-xl md:text-2xl font-black text-indigo-500">{r.price}<span className="text-[10px] ml-1 font-bold text-zinc-500">USDC</span></span>
                       <span className="text-[9px] md:text-[10px] text-zinc-500 font-medium">{r.schedule}</span>
                    </div>
                    
                    <div className="flex gap-1.5 md:gap-2">
                      <button 
                        onClick={() => onJoinChat(r)}
                        className="p-2.5 md:p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all relative"
                        title="Community Chat"
                      >
                        <MessageSquare size={16} />
                        <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full border border-white dark:border-zinc-900" />
                      </button>
                      <button 
                        onClick={() => setSelectedRoute(r)} 
                        className="flex items-center gap-1 md:gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-md"
                      >
                        Book
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 px-1">
          <div className="bg-white dark:bg-zinc-900 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500" />
            
            <button 
              onClick={() => setSelectedRoute(null)} 
              className="mb-6 md:mb-8 flex items-center gap-2 text-xs md:text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={14} /> 
              Back
            </button>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 md:mb-8">
              <div>
                <span className="text-[9px] md:text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-full mb-2 md:mb-3 inline-block">Confirm Booking</span>
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">{selectedRoute.name}</h3>
                <p className="text-zinc-500 mt-1 flex items-center gap-1.5 text-xs">
                   <MapPin size={12} /> {selectedRoute.origin} to {selectedRoute.destination}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-2xl md:text-3xl font-black">{selectedRoute.price} <span className="text-[10px] md:text-sm font-medium text-zinc-500 uppercase tracking-tighter">USDC</span></p>
                <p className="text-[10px] text-zinc-500 font-mono">EST_FEE: 0.00 ARC</p>
              </div>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Passenger Name</label>
                <input 
                  value={passengerName} 
                  onChange={(e) => setPassengerName(e.target.value)} 
                  placeholder="Enter legal name..." 
                  className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl md:rounded-2xl p-3.5 md:p-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-shadow" 
                />
              </div>

              <div className="p-3.5 md:p-4 rounded-xl md:rounded-2xl bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10">
                <div className="flex items-start gap-3 text-indigo-600 dark:text-indigo-400">
                   <Sparkles size={16} className="flex-shrink-0 mt-0.5" />
                   <p className="text-[11px] md:text-xs font-medium leading-relaxed">Ticket minted as a dynamic NFT on Arc Network. Valid for 2 hours.</p>
                </div>
              </div>

              <button 
                onClick={handlePaySelf} 
                disabled={processing || !walletState.isConnected} 
                className={`w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-all flex items-center justify-center gap-3 ${
                  !walletState.isConnected 
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' 
                  : 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:scale-[0.98] active:scale-95 shadow-lg'
                }`}
              >
                {processing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    MINTING...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    {walletState.isConnected ? `Pay ${selectedRoute.price} USDC` : 'Connect Wallet'}
                  </>
                )}
              </button>
              
              {!walletState.isConnected && (
                <p className="text-center text-[9px] md:text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Authorize via wallet provider</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Purchased Tickets Section */}
      {tickets.length > 0 && (
        <div className="pt-8 md:pt-12 border-t border-zinc-200 dark:border-zinc-900">
          <div className="flex items-center justify-between mb-6 md:mb-8 px-1">
            <h2 className="text-xl md:text-2xl font-bold">Active Tickets</h2>
            <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] md:text-xs font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full">
               <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
               LIVE_ARC
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {tickets.map(t => <TicketCard key={t.id} ticket={t} />)}
          </div>
        </div>
      )}
    </div>
  );
};
