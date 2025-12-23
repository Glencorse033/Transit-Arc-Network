
import React, { useState, useEffect, useRef } from 'react';
import { generateRoutes, analyzeLocationFromImage, DEFAULT_ROUTES, fetchRealWorldRoutes, RealWorldTransitResponse } from '../services/geminiService.ts';
import { TransitRoute, Ticket, PaymentLink, WalletState } from '../types.ts';
import { TicketCard } from './TicketCard.tsx';
import { 
  MapPin, Bus, Train, Ship, Share2, ArrowRight, Wallet, 
  Check, Copy, Clock, Loader2, ArrowLeft, Search, 
  MessageSquare, Users, Sparkles, Map as MapIcon, AlertCircle, RefreshCw, Camera, X, ImageOff, Globe, ExternalLink
} from 'lucide-react';

interface Props {
  walletState: WalletState;
  onUpdateWallet: (newBalance: number) => void;
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
    if (!cityName.trim() && !isLiveMode) return;
    setLoadingRoutes(true);
    setError(null);
    setRealWorldData(null);

    try {
      if (isLiveMode) {
        // Use Real-world Maps Grounding
        const pos = await new Promise<GeolocationPosition>((res, rej) => {
          navigator.geolocation.getCurrentPosition(res, rej);
        }).catch(() => null);

        const result = await fetchRealWorldRoutes(cityName || "nearby", pos ? { lat: pos.coords.latitude, lng: pos.coords.longitude } : undefined);
        setRealWorldData(result);
      } else {
        // Use Simulated AI Route Generation
        const result = await generateRoutes(cityName);
        if (result.length === 0) setError("No routes found.");
        setRoutes(result);
      }
    } catch (err) {
      setError("Failed to fetch data. Please ensure location services are enabled.");
    } finally {
      setLoadingRoutes(false);
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

  const handleImageError = (id: string) => {
    setBrokenImages(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Mode Switcher */}
      <div className="flex justify-center mb-4">
        <div className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl flex gap-1 border border-zinc-200 dark:border-zinc-800">
          <button 
            onClick={() => { setIsLiveMode(false); setRealWorldData(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${!isLiveMode ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-500' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            <Sparkles size={14} /> Discovery
          </button>
          <button 
            onClick={() => { setIsLiveMode(true); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isLiveMode ? 'bg-white dark:bg-zinc-800 shadow-sm text-emerald-500' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            <Globe size={14} /> Live Network
          </button>
        </div>
      </div>

      {/* City Search Bar with Vision */}
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
              placeholder={isLiveMode ? "Search city or stay empty for nearby..." : "Search city, station or landmark..."}
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
                className={`${isLiveMode ? 'bg-emerald-500' : 'bg-zinc-900 dark:bg-white text-white dark:text-black'} px-4 md:px-6 py-2 rounded-xl text-xs md:text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50`}
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

      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(76px); }
        }
      `}</style>

      {!selectedRoute ? (
        <div className="space-y-6 md:space-y-8">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
              {isLiveMode ? <Globe size={18} className="text-emerald-500" /> : <MapIcon size={18} className="text-indigo-500" />}
              {isLiveMode ? "Live Transit Discovery" : city ? `Routes in ${city}` : 'Available Transit Network'}
            </h2>
            <div className="text-[10px] md:text-xs font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2 md:px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800">
              {loadingRoutes ? "SEARCHING..." : isLiveMode ? "LIVE DATA" : `${routes.length} ROUTES`}
            </div>
          </div>

          {loadingRoutes ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-56 md:h-64 rounded-3xl bg-zinc-100 dark:bg-zinc-900 animate-pulse border border-zinc-200 dark:border-zinc-800" />
              ))}
            </div>
          ) : isLiveMode && realWorldData ? (
            <div className="bg-white dark:bg-zinc-950 p-6 md:p-8 rounded-[2.5rem] border border-emerald-500/20 shadow-xl animate-in fade-in slide-in-from-bottom-4">
               <div className="mb-6">
                 <div className="flex items-center gap-2 text-emerald-500 mb-2">
                   <Globe size={16} />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Grounded Real-Time Data</span>
                 </div>
                 <div className="prose prose-sm dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300 whitespace-pre-line">
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
                             {chunk.maps.title || "View Schedule"}
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
              <h3 className="text-2xl md:text-3xl font-bold">{selectedRoute.name}</h3>
              <p className="text-zinc-500 text-sm">{selectedRoute.origin} to {selectedRoute.destination}</p>
            </div>
            <div className="space-y-4">
              <input value={passengerName} onChange={(e) => setPassengerName(e.target.value)} placeholder="Passenger Name" className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm outline-none" />
              <button onClick={handlePaySelf} disabled={processing || !walletState.isConnected} className="w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black font-bold flex items-center justify-center gap-2 shadow-lg">
                {processing ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                {walletState.isConnected ? `Pay ${selectedRoute.price} USDC` : 'Connect Wallet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
