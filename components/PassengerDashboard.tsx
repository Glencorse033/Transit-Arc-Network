import React, { useState, useEffect } from 'react';
import { generateRoutes } from '../services/geminiService';
import { TransitRoute, Ticket, PaymentLink, WalletState } from '../types';
import { TicketCard } from './TicketCard';
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
  const [generatedLink, setGeneratedLink] = useState<PaymentLink | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRoutes(city);
  }, []);

  const fetchRoutes = async (cityName: string) => {
    setLoadingRoutes(true);
    const result = await generateRoutes(cityName);
    setRoutes(result);
    setLoadingRoutes(false);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'BUS': return <Bus size={16} />;
      case 'TRAIN': return <Train size={16} />;
      case 'METRO': return <Train size={16} />;
      case 'FERRY': return <Ship size={16} />;
      default: return <Bus size={16} />;
    }
  };

  const handlePaySelf = () => {
    if (!walletState.isConnected) {
      alert("Please connect wallet first!");
      return;
    }
    if (walletState.balance < (selectedRoute?.price || 0)) {
      alert("Insufficient Balance");
      return;
    }

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
        qrData: `TRANSIT-ARC:${selectedRoute!.id}:${Date.now()}`,
        txHash: '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        imageUrl: selectedRoute!.imageUrl
      };
      setTickets([newTicket, ...tickets]);
      setSelectedRoute(null);
      setPassengerName("");
      setProcessing(false);
    }, 2000);
  };

  const handleGenerateLink = () => {
     if (!walletState.isConnected) {
      alert("Please connect wallet to sign the request");
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      const link: PaymentLink = {
        id: Math.random().toString(36).substr(2, 9),
        routeId: selectedRoute!.id,
        passengerName: passengerName || "Guest",
        amount: selectedRoute!.price,
        createdAt: Date.now(),
        expiresAt: Date.now() + 86400000,
        isPaid: false,
        creatorAddress: walletState.address!
      };
      onCreateLink(link);
      setGeneratedLink(link);
      setProcessing(false);
    }, 1500);
  };

  const resetSelection = () => {
    setSelectedRoute(null);
    setGeneratedLink(null);
    setPassengerName("");
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
             <h2 className="font-semibold flex items-center gap-3 text-lg">
                <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg text-indigo-500">
                    <MapPin size={20} />
                </div>
                Plan Your Trip
             </h2>
             <div className="flex gap-2 w-full md:w-auto relative group">
                 <input 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="text-sm bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 w-full md:w-64 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-zinc-400 dark:placeholder-zinc-600 pl-10"
                    placeholder="Enter City or Station"
                 />
                 <Search className="absolute left-3 top-2.5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                 <button onClick={() => fetchRoutes(city)} className="text-sm bg-zinc-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl hover:opacity-90 transition-all font-bold">
                    Search
                 </button>
             </div>
        </div>

        {!selectedRoute ? (
            <div className="p-6">
                {loadingRoutes ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="animate-spin text-indigo-500" size={40} />
                        <p className="text-sm text-zinc-500 font-mono">SCANNING_ROUTES...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {routes.map(route => (
                            <div 
                                key={route.id}
                                className="group relative w-full flex items-center gap-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-zinc-600 hover:bg-white dark:hover:bg-zinc-800/50 transition-all overflow-hidden shadow-sm"
                            >
                                <div className="w-28 h-20 shrink-0 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 relative">
                                    <img src={route.imageUrl} alt={route.destination} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md p-1.5 rounded-md text-white border border-white/10 z-20">
                                        {getIcon(route.type)}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-lg leading-tight truncate pr-4">{route.name}</h3>
                                        <span className="shrink-0 font-bold text-xl">{route.price.toFixed(2)} <span className="text-xs font-normal text-zinc-500">USDC</span></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-zinc-500 mb-3">
                                        <span className="truncate max-w-[120px]">{route.origin}</span>
                                        <ArrowRight size={14} className="text-zinc-300 dark:text-zinc-600"/> 
                                        <span className="font-medium text-zinc-900 dark:text-white truncate">{route.destination}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-auto">
                                        <button 
                                          onClick={() => setSelectedRoute(route)}
                                          className="text-xs bg-zinc-900 dark:bg-white text-white dark:text-black px-4 py-1.5 rounded-lg hover:opacity-90 font-bold transition-all"
                                        >
                                          Book Now
                                        </button>
                                        <button 
                                          onClick={() => onJoinChat(route)}
                                          className="text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-4 py-1.5 rounded-lg hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white font-bold transition-all flex items-center gap-1.5"
                                        >
                                          <MessageSquare size={12} /> Community
                                        </button>
                                        <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 ml-auto flex items-center gap-1">
                                            <Clock size={10} /> {route.schedule}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        ) : (
            <div className="p-0">
                <div className="relative h-64 w-full overflow-hidden bg-zinc-900">
                    <img src={selectedRoute.imageUrl} className="w-full h-full object-cover opacity-50" alt={selectedRoute.destination} />
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-900 via-transparent to-transparent" />
                    <button onClick={resetSelection} className="absolute top-6 left-6 text-white hover:text-indigo-400 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium border border-white/10">
                        <ArrowLeft size={16} /> Return to Search
                    </button>
                    <div className="absolute bottom-0 left-0 w-full p-8">
                        <h3 className="text-4xl font-bold dark:text-white text-zinc-900 mb-2">{selectedRoute.name}</h3>
                        <p className="text-indigo-600 dark:text-indigo-300 flex items-center gap-2 text-lg font-medium">
                            {selectedRoute.origin} <ArrowRight size={18} className="text-zinc-400"/> {selectedRoute.destination}
                        </p>
                    </div>
                </div>

                <div className="p-8">
                    <div className="flex flex-col md:flex-row gap-8 mb-8">
                         <div className="flex-1 bg-zinc-100 dark:bg-black/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <p className="text-zinc-500 text-sm mb-2 uppercase tracking-wide font-semibold">Total Fare</p>
                            <p className="text-4xl font-bold">{selectedRoute.price.toFixed(2)} <span className="text-xl font-medium text-zinc-400">USDC</span></p>
                         </div>
                         <div className="flex-1 bg-zinc-100 dark:bg-black/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                             <p className="text-zinc-500 text-sm mb-2 uppercase tracking-wide font-semibold">Frequency</p>
                             <p className="font-bold text-2xl">{selectedRoute.schedule}</p>
                         </div>
                    </div>

                    <div className="space-y-6 max-w-2xl mx-auto">
                        <div>
                            <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Passenger Name</label>
                            <input 
                                type="text" 
                                className="w-full bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="e.g. Satoshi Nakamoto"
                                value={passengerName}
                                onChange={(e) => setPassengerName(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <button 
                                onClick={() => setPaymentMode('SELF')}
                                className={`p-5 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all ${paymentMode === 'SELF' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-400'}`}
                             >
                                <Wallet size={24} />
                                <span className="font-semibold text-sm">Pay Now</span>
                             </button>
                             <button 
                                onClick={() => setPaymentMode('LINK')}
                                className={`p-5 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all ${paymentMode === 'LINK' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-400'}`}
                             >
                                <Share2 size={24} />
                                <span className="font-semibold text-sm">Send Link</span>
                             </button>
                        </div>

                        <button 
                            onClick={paymentMode === 'SELF' ? handlePaySelf : handleGenerateLink}
                            disabled={processing}
                            className="w-full bg-indigo-600 dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl shadow-xl hover:opacity-90 transition-all disabled:opacity-50 flex justify-center items-center gap-3 text-lg"
                        >
                            {processing ? <Loader2 className="animate-spin" /> : (paymentMode === 'SELF' ? <Check size={20} strokeWidth={3} /> : <Share2 size={20} />)}
                            {processing ? 'Processing...' : (paymentMode === 'SELF' ? 'Confirm Payment' : 'Create Payment Link')}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>

      {tickets.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-zinc-200 dark:border-zinc-900">
              <h3 className="font-bold text-xl flex items-center gap-3 px-1">
                  <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                  My Active Tickets
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {tickets.map(ticket => (
                      <TicketCard key={ticket.id} ticket={ticket} />
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};