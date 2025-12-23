
import React, { useState, useEffect, useRef } from 'react';
import { generateRoutes, analyzeLocationFromImage, DEFAULT_ROUTES, fetchRealWorldRoutes, RealWorldTransitResponse } from '../services/geminiService.ts';
import { TransitRoute, Ticket, PaymentLink, WalletState } from '../types.ts';
import { TicketCard } from './TicketCard.tsx';
import { 
  MapPin, Bus, Train, Ship, Share2, ArrowRight, Wallet, 
  Check, Copy, Clock, Loader2, ArrowLeft, Search, 
  MessageSquare, Users, Sparkles, Map as MapIcon, AlertCircle, RefreshCw, Camera, X, ImageOff, Globe, ExternalLink, CreditCard
} from 'lucide-react';

interface Props {
  walletState: WalletState;
  onUpdateWallet: () => void;
  onCreateLink: (link: PaymentLink) => void;
  onJoinChat: (route: TransitRoute) => void;
}

export const PassengerDashboard: React.FC<Props> = ({ walletState, onUpdateWallet, onCreateLink, onJoinChat }) => {
  const [routes, setRoutes] = useState<TransitRoute[]>(DEFAULT_ROUTES);
  const [realWorldData, setRealWorldData] = useState<RealWorldTransitResponse | null>(null);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<TransitRoute | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [passengerName, setPassengerName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRoutes = async (cityName: string) => {
    if (!cityName.trim() && !isLiveMode) {
      setRoutes(DEFAULT_ROUTES);
      return;
    }

    setLoadingRoutes(true);
    setError(null);
    setRealWorldData(null);

    try {
      if (isLiveMode) {
        let pos = null;
        if (!cityName.trim()) {
          try {
            pos = await new Promise<GeolocationPosition>((res, rej) => {
              navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 });
            });
          } catch (geoErr) {
            console.warn("TransitArc: Geolocation unavailable or timed out.", geoErr);
          }
        }

        const result = await fetchRealWorldRoutes(cityName || "nearby", pos ? { lat: pos.coords.latitude, lng: pos.coords.longitude } : undefined);
        
        if (!result.text || result.text.includes("No verified transit information")) {
          setError(`No live transit results for "${cityName || 'your location'}"`);
        } else {
          setRealWorldData(result);
        }
      } else {
        const result = await generateRoutes(cityName);
        if (result.length === 0) {
          setError(`Could not plan routes for "${cityName}"`);
        } else {
          setRoutes(result);
        }
      }
    } catch (err) {
      setError("Transit network communication failed.");
    } finally {
      setLoadingRoutes(false);
    }
  };

  const handlePaySelf = async () => {
    if (!walletState.isConnected || !selectedRoute) return;
    
    setProcessing(true);
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) throw new Error("Wallet not found");

      // Designation Operator Address (Example Burn Address or predefined vault)
      const operatorAddress = '0x0000000000000000000000000000000000000000';
      
      // Calculate a nominal value in Wei (representing the USDC price)
      // For demo, we send a tiny amount: 0.0001 ETH
      const amountInWei = '0x38D7EA4C68000'; // 0.0001 ETH in Hex

      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletState.address,
          to: operatorAddress,
          value: amountInWei,
          gas: '0x5208', // 21000 gas
        }],
      });

      // Simulation of block confirmation
      setTimeout(() => {
        const newTicket: Ticket = {
          id: Math.random().toString(36).substr(2, 9),
          routeId: selectedRoute.id,
          routeName: selectedRoute.name,
          passengerName: passengerName || "Self",
          status: 'ACTIVE',
          purchaseDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 3600 * 2000).toISOString(),
          qrData: `TRANSIT-ARC:${selectedRoute.id}:${txHash}`,
          txHash: txHash,
          imageUrl: selectedRoute.imageUrl
        };
        setTickets([newTicket, ...tickets]);
        setSelectedRoute(null);
        setProcessing(false);
        onUpdateWallet(); // Refresh balance
      }, 2000);
      
    } catch (err) {
      console.error("Payment failed:", err);
      setProcessing(false);
      alert("Payment failed or was rejected. Please try again.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setImagePreview(reader.result as string);
      setAnalyzingImage(true);
      setError(null);

      try {
        const detectedCity = await analyzeLocationFromImage(base64);
        if (detectedCity) {
          setCity(detectedCity);
          fetchRoutes(detectedCity);
        } else {
          setError("Could not identify the location.");
        }
      } catch (err) {
        setError("Could not analyze image.");
      } finally {
        setAnalyzingImage(false);
        setTimeout(() => setImagePreview(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'TRAIN': return <Train size={16} />;
      case 'METRO': return <Train size={16} />;
      case 'FERRY': return <Ship size={16} />;
      default: return <Bus size={16} />;
    }
  };

  const handleImageError = (id: string) => {
    setBrokenImages(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Mode Switcher */}
      <div className="flex justify-center mb-4">
        <div className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl flex gap-1 border border-zinc-200 dark:border-zinc-800">
          <button 
            onClick={() => { setIsLiveMode(false); setRealWorldData(null); setError(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${!isLiveMode ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-500' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            <Sparkles size={14} /> Discovery
          </button>
          <button 
            onClick={() => { setIsLiveMode(true); setRealWorldData(null); setError(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isLiveMode ? 'bg-white dark:bg-zinc-800 shadow-sm text-emerald-500' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            <Globe size={14} /> Live Network
          </button>
        </div>
      </div>

      {!selectedRoute && (
        <div className="relative w-full max-w-xl mx-auto">
          <div className="group relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-indigo-500 transition-colors">
              <Search size={18} />
            </div>
            <input 
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-11 pr-32 py-3.5 md:py-4 text-sm md:text-lg font-medium shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              placeholder={isLiveMode ? "Type city name or search empty for local..." : "Where do you want to go?"}
              onKeyDown={(e) => e.key === 'Enter' && fetchRoutes(city)}
            />
            <div className="absolute right-1.5 inset-y-1.5 flex items-center gap-1.5">
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={analyzingImage}
                className="p-2 rounded-xl text-zinc-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all"
                title="Scan with AI Vision"
              >
                {analyzingImage ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
              </button>
              <button 
                onClick={() => fetchRoutes(city)} 
                disabled={loadingRoutes}
                className={`${isLiveMode ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90'} px-4 md:px-6 py-2 rounded-xl text-xs md:text-sm font-bold transition-all disabled:opacity-50`}
              >
                {loadingRoutes ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
              </button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>

          {imagePreview && (
            <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-32 h-20 rounded-xl overflow-hidden border-2 border-indigo-500 shadow-2xl z-20 animate-in zoom-in-90 fade-in">
              <img src={imagePreview} className="w-full h-full object-cover blur-[1px]" />
              <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                 {analyzingImage ? (
                   <div className="relative w-full h-full">
                      <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_10px_#6366f1]" />
                   </div>
                 ) : (
                   <Check size={20} className="text-emerald-400" />
                 )}
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedRoute ? (
        <div className="space-y-6 md:space-y-8">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
              {isLiveMode ? <Globe size={18} className="text-emerald-500" /> : <MapIcon size={18} className="text-indigo-500" />}
              {isLiveMode ? "Real-Time Grounding" : city ? `Routes in ${city}` : 'Global Network'}
            </h2>
            <div className="text-[10px] md:text-xs font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2 md:px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 uppercase tracking-widest">
              {loadingRoutes ? "Syncing..." : isLiveMode ? "Verified Data" : `${routes.length} Available`}
            </div>
          </div>

          {loadingRoutes ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-56 md:h-64 rounded-3xl bg-zinc-100 dark:bg-zinc-900 animate-pulse border border-zinc-200 dark:border-zinc-800" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-zinc-950 p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 text-center space-y-4">
               <AlertCircle size={48} className="mx-auto text-amber-500 opacity-50" />
               <div className="max-w-md mx-auto">
                 <h3 className="text-lg font-bold">Heads up!</h3>
                 <p className="text-zinc-500 text-sm mt-2">{error}</p>
                 <button onClick={() => { setCity(""); setRoutes(DEFAULT_ROUTES); setError(null); }} className="mt-6 text-indigo-500 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
                   <RefreshCw size={14} /> Reset Search
                 </button>
               </div>
            </div>
          ) : isLiveMode && realWorldData ? (
            <div className="bg-white dark:bg-zinc-950 p-6 md:p-8 rounded-[2.5rem] border border-emerald-500/20 shadow-xl animate-in fade-in slide-in-from-bottom-4">
               <div className="mb-6">
                 <div className="flex items-center gap-2 text-emerald-500 mb-2">
                   <Globe size={16} />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Grounded Real-Time Data</span>
                 </div>
                 <div className="prose prose-sm dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                   {realWorldData.text}
                 </div>
               </div>
               {realWorldData.groundingChunks.length > 0 && (
                 <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Official Sources & Schedules</p>
                    <div className="flex flex-wrap gap-2">
                       {realWorldData.groundingChunks.map((chunk, i) => (
                         chunk.maps?.uri && (
                           <a 
                             key={i} 
                             href={chunk.maps.uri} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 hover:bg-emerald-500 hover:text-white border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                           >
                             <ExternalLink size={14} />
                             {chunk.maps.title || "View Route Details"}
                           </a>
                         )
                       ))}
                    </div>
                 </div>
               )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {routes.map(r => (
                <div key={r.id} className="group relative bg-white dark:bg-zinc-950 rounded-2xl md:rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-indigo-500/50 transition-all duration-300 shadow-sm hover:shadow-xl">
                  <div className="h-40 md:h-44 w-full relative overflow-hidden bg-zinc-200 dark:bg-zinc-900">
                    {!brokenImages[r.id] ? (
                      <img 
                        src={r.imageUrl} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        alt={r.destination} 
                        onError={() => handleImageError(r.id)}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-200 dark:bg-zinc-900 text-zinc-400">
                        <ImageOff size={32} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <div className="bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-white/10">
                        {getTransportIcon(r.type)}
                        {r.type}
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-zinc-300 text-[10px] uppercase font-bold truncate">{r.origin} → {r.destination}</p>
                      <h3 className="text-lg font-bold text-white leading-tight">{r.name}</h3>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <span className="text-xl font-black text-indigo-500">{r.price}<span className="text-[10px] ml-1 text-zinc-500">USDC</span></span>
                      <p className="text-[10px] text-zinc-500">{r.schedule}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => onJoinChat(r)} className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-indigo-500 transition-all">
                        <MessageSquare size={16} />
                      </button>
                      <button onClick={() => setSelectedRoute(r)} className="bg-zinc-900 dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-xl text-xs font-bold hover:scale-[1.02] transition-all">
                        Book
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
          <div className="bg-white dark:bg-zinc-900 p-5 md:p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500" />
            <button onClick={() => setSelectedRoute(null)} className="mb-6 flex items-center gap-2 text-xs text-zinc-500">
              <ArrowLeft size={14} /> Back
            </button>
            <div className="mb-8">
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] mb-2 block">Confirm Web3 Ticket</span>
              <h3 className="text-2xl md:text-3xl font-bold">{selectedRoute.name}</h3>
              <p className="text-zinc-500 text-sm">{selectedRoute.origin} to {selectedRoute.destination}</p>
            </div>
            <div className="space-y-4">
              <input value={passengerName} onChange={(e) => setPassengerName(e.target.value)} placeholder="Passenger Name" className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" />
              <button 
                onClick={handlePaySelf} 
                disabled={processing || !walletState.isConnected} 
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                  processing ? 'bg-zinc-200 text-zinc-500' : 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:scale-[0.98] active:scale-95'
                }`}
              >
                {processing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Waiting for Confirmation...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    {walletState.isConnected ? `Confirm & Pay USDC` : 'Connect Wallet First'}
                  </>
                )}
              </button>
              <p className="text-[10px] text-center text-zinc-500 uppercase tracking-widest font-medium">Transaction will be initiated via MetaMask</p>
            </div>
          </div>
        </div>
      )}

      {tickets.length > 0 && (
        <div className="pt-8 md:pt-12 border-t border-zinc-200 dark:border-zinc-900">
          <div className="flex items-center justify-between mb-6 md:mb-8 px-1">
            <h2 className="text-xl md:text-2xl font-bold">Active Web3 Tickets</h2>
            <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] md:text-xs font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full">
               <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
               SECURED_ON_CHAIN
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {tickets.map(t => <TicketCard key={t.id} ticket={t} />)}
          </div>
        </div>
      )}
    </div>
  );
};
