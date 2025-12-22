import React, { useState, useEffect } from 'react';
import { WalletButton } from './components/WalletButton';
import { PassengerDashboard } from './components/PassengerDashboard';
import { OperatorDashboard } from './components/OperatorDashboard';
import { PaymentLinkView } from './components/PaymentLinkView';
import { VaultDashboard } from './components/VaultDashboard';
import { RouteChat } from './components/RouteChat';
import { WalletState, UserRole, PaymentLink, VaultState, TransitRoute } from './types';
import { ShieldCheck, Menu, X, Landmark, Settings as SettingsIcon, Sun, Moon, Type, LayoutGrid, MessageSquare } from 'lucide-react';

interface AppSettings {
  theme: 'light' | 'dark';
  font: 'inter' | 'futuristic' | 'mono';
  visualStyle: 'glass' | 'flat';
}

// Custom Futuristic Logo Component
const TransitArcLogo = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-500">
    <defs>
      <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#818cf8" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
        <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <path d="M20 4C11.1634 4 4 11.1634 4 20C4 28.8366 11.1634 36 20 36" stroke="url(#logoGradient)" strokeWidth="3" strokeLinecap="round" filter="url(#glow)" />
    <path d="M36 20C36 11.1634 28.8366 4 20 4" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.5" />
    <path d="M20 36C28.8366 36 36 28.8366 36 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <circle cx="20" cy="20" r="6" fill="currentColor" className="text-zinc-900 dark:text-white" />
    <circle cx="20" cy="20" r="3" fill="#4f46e5" />
  </svg>
);

export default function App() {
  const [view, setView] = useState<UserRole | 'LINK_PAYMENT' | 'VAULT' | 'CHAT'>(UserRole.PASSENGER);
  const [activeChatRoute, setActiveChatRoute] = useState<TransitRoute | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // App Personalization State
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    font: 'inter',
    visualStyle: 'glass'
  });

  // Effect to apply theme and font to the document
  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Apply Font Class
    const fontClassMap = {
      inter: 'font-inter',
      futuristic: 'font-futuristic',
      mono: 'font-mono-tech'
    };
    
    // Remove old font classes
    Object.values(fontClassMap).forEach(cls => root.classList.remove(cls));
    root.classList.add(fontClassMap[settings.font]);
  }, [settings]);

  // Global State
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: 0
  });

  // Vault State
  const [vault, setVault] = useState<VaultState>({
    balance: 0,
    lockedAmount: 0,
    yieldEarned: 12.45,
    points: 120,
    apy: 4.5,
    nfts: [],
    lockPeriod: 'NONE'
  });

  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [targetLinkId, setTargetLinkId] = useState<string | null>(null);

  const connectWallet = () => {
    setWallet({
      isConnected: true,
      address: '0x71C...9A23',
      balance: 145.50
    });
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      balance: 0
    });
  };

  const updateBalance = (newBalance: number) => {
    setWallet(prev => ({ ...prev, balance: newBalance }));
  };

  const createLink = (link: PaymentLink) => {
    setPaymentLinks(prev => [link, ...prev]);
  };

  const handlePayLink = (id: string) => {
    setPaymentLinks(prev => prev.map(l => l.id === id ? { ...l, isPaid: true } : l));
    const link = paymentLinks.find(l => l.id === id);
    if (link) {
        updateBalance(wallet.balance - link.amount);
    }
  };

  const openLinkPayment = (id?: string) => {
      if (id) setTargetLinkId(id);
      setView('LINK_PAYMENT');
      setIsMenuOpen(false);
  };

  const openChat = (route: TransitRoute) => {
    setActiveChatRoute(route);
    setView('CHAT');
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${settings.theme === 'dark' ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'} selection:bg-indigo-500 selection:text-white flex flex-col`}>
      
      {/* Navbar */}
      <nav className={`sticky top-0 z-50 border-b transition-all duration-300 ${settings.visualStyle === 'glass' ? 'glass border-zinc-900/10 dark:border-zinc-900/50' : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setView(UserRole.PASSENGER)}>
               <TransitArcLogo />
               <div className="flex flex-col leading-none">
                  <span className="font-bold text-xl tracking-tighter uppercase">TRANSIT <span className="text-indigo-500">ARC</span></span>
                  <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Decentralized Mobility</span>
               </div>
            </div>

            {/* Desktop Navigation */}
            <div className={`hidden md:flex items-center space-x-1 p-1 rounded-full border transition-colors ${settings.theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-200/50 border-zinc-300'}`}>
               <button 
                onClick={() => setView(UserRole.PASSENGER)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${view === UserRole.PASSENGER ? 'bg-white text-black shadow-lg dark:bg-white dark:text-black' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
               >
                Passenger
               </button>
               <button 
                onClick={() => setView('VAULT')}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${view === 'VAULT' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
               >
                Vault
               </button>
               <button 
                onClick={() => setView(UserRole.OPERATOR)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${view === UserRole.OPERATOR ? 'bg-white text-black shadow-lg' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
               >
                Operator
               </button>
               <button 
                onClick={() => openLinkPayment()}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${view === 'LINK_PAYMENT' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
               >
                Pay Link
               </button>
            </div>

            {/* Right side Actions */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <button 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`p-2.5 rounded-full border transition-all ${settings.theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 shadow-sm'}`}
                >
                   <SettingsIcon size={18} className={`${isSettingsOpen ? 'rotate-90' : 'rotate-0'} transition-transform duration-300`} />
                </button>
                
                {/* Settings Dropdown */}
                {isSettingsOpen && (
                  <div className={`absolute right-0 mt-3 w-64 rounded-2xl border p-4 shadow-2xl animate-in fade-in zoom-in-95 origin-top-right z-50 ${settings.theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'}`}>
                    <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-zinc-500">App Personalization</h3>
                    
                    {/* Theme Toggle */}
                    <div className="mb-4">
                      <p className="text-xs font-medium mb-2 opacity-60">Appearance</p>
                      <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-black p-1 rounded-xl">
                        <button 
                          onClick={() => setSettings(s => ({...s, theme: 'light'}))}
                          className={`flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all ${settings.theme === 'light' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                          <Sun size={14} /> Light
                        </button>
                        <button 
                          onClick={() => setSettings(s => ({...s, theme: 'dark'}))}
                          className={`flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all ${settings.theme === 'dark' ? 'bg-zinc-800 text-indigo-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                          <Moon size={14} /> Dark
                        </button>
                      </div>
                    </div>

                    {/* Font Selector */}
                    <div className="mb-4">
                      <p className="text-xs font-medium mb-2 opacity-60">Typography</p>
                      <div className="flex flex-col gap-1">
                        {[
                          { id: 'inter', name: 'Inter (Sans)', class: 'font-inter' },
                          { id: 'futuristic', name: 'Orbitron (Futur)', class: 'font-futuristic' },
                          { id: 'mono', name: 'Space Mono (Tech)', class: 'font-mono-tech' }
                        ].map((f) => (
                          <button 
                            key={f.id}
                            onClick={() => setSettings(s => ({...s, font: f.id as any}))}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${settings.font === f.id ? 'bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500'}`}
                          >
                            <span className={f.class}>{f.name}</span>
                            {settings.font === f.id && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Style Toggle */}
                    <div>
                      <p className="text-xs font-medium mb-2 opacity-60">Visual Style</p>
                      <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-black p-1 rounded-xl">
                        <button 
                          onClick={() => setSettings(s => ({...s, visualStyle: 'glass'}))}
                          className={`flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all ${settings.visualStyle === 'glass' ? (settings.theme === 'dark' ? 'bg-zinc-800 text-white shadow-sm' : 'bg-white text-black shadow-sm') : 'text-zinc-500'}`}
                        >
                          <LayoutGrid size={14} /> Glass
                        </button>
                        <button 
                          onClick={() => setSettings(s => ({...s, visualStyle: 'flat'}))}
                          className={`flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all ${settings.visualStyle === 'flat' ? (settings.theme === 'dark' ? 'bg-zinc-800 text-white shadow-sm' : 'bg-white text-black shadow-sm') : 'text-zinc-500'}`}
                        >
                          <ShieldCheck size={14} /> Flat
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <WalletButton 
                walletState={wallet} 
                onConnect={connectWallet} 
                onDisconnect={disconnectWallet} 
              />
              <button className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                 {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={`md:hidden border-t absolute w-full shadow-2xl transition-colors ${settings.theme === 'dark' ? 'border-zinc-900 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
             <div className="px-4 py-3 space-y-2">
               <button 
                onClick={() => { setView(UserRole.PASSENGER); setIsMenuOpen(false); }}
                className="block w-full text-left px-3 py-3 rounded-lg text-base font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
               >
                Passenger
               </button>
               <button 
                onClick={() => { setView('VAULT'); setIsMenuOpen(false); }}
                className="block w-full text-left px-3 py-3 rounded-lg text-base font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
               >
                Vault & Rewards
               </button>
               <button 
                onClick={() => { setView(UserRole.OPERATOR); setIsMenuOpen(false); }}
                className="block w-full text-left px-3 py-3 rounded-lg text-base font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
               >
                Operator Portal
               </button>
               <button 
                onClick={() => { openLinkPayment(); setIsMenuOpen(false); }}
                className="block w-full text-left px-3 py-3 rounded-lg text-base font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
               >
                Pay for Others
               </button>
             </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        
        {view === UserRole.PASSENGER && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">The Future of Transit</h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-lg mx-auto">Seamless payments on the Arc Network. Book tickets instantly or chat with fellow commuters.</p>
             </div>
             <PassengerDashboard 
                walletState={wallet} 
                onUpdateWallet={updateBalance} 
                onCreateLink={createLink}
                onJoinChat={openChat}
             />
          </div>
        )}

        {view === 'VAULT' && (
          <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className={`mb-10 flex flex-col md:flex-row justify-between items-end gap-4 border-b pb-8 ${settings.theme === 'dark' ? 'border-zinc-900' : 'border-zinc-200'}`}>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Transit Vault</h1>
                  <p className="text-zinc-500 dark:text-zinc-400">Maximize your travel capital with automated yield and rewards.</p>
                </div>
                <div className="hidden sm:block">
                  <div className={`border px-4 py-2 rounded-full flex items-center gap-2 font-medium text-sm transition-colors ${settings.theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-600 shadow-sm'}`}>
                    <Landmark size={16} className="text-indigo-400" />
                    <span>Backed by Arc Treasury</span>
                  </div>
                </div>
             </div>
             {!wallet.isConnected ? (
                <div className={`flex flex-col items-center justify-center py-24 rounded-3xl border text-center px-4 transition-colors ${settings.theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-200 shadow-xl'}`}>
                    <div className={`p-5 rounded-full mb-6 ring-4 ${settings.theme === 'dark' ? 'bg-zinc-800 ring-zinc-900' : 'bg-zinc-100 ring-zinc-50'}`}>
                        <Landmark size={40} className="text-zinc-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Connect Wallet to Access Vault</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-md mb-8">Start earning passive income on your transit funds and unlock exclusive commuter rewards.</p>
                    <div className="scale-110">
                         <WalletButton walletState={wallet} onConnect={connectWallet} onDisconnect={disconnectWallet} />
                    </div>
                </div>
             ) : (
                <VaultDashboard 
                   walletState={wallet} 
                   vaultState={vault} 
                   onUpdateVault={setVault}
                   onUpdateWallet={updateBalance}
                />
             )}
          </div>
        )}

        {view === UserRole.OPERATOR && (
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className={`mb-10 flex justify-between items-end border-b pb-8 ${settings.theme === 'dark' ? 'border-zinc-900' : 'border-zinc-200'}`}>
                <div>
                    <h1 className="text-3xl font-bold mb-2">Operator Dashboard</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Real-time revenue analytics and validation.</p>
                </div>
                <div className="text-xs bg-emerald-950/30 text-emerald-400 border border-emerald-900/50 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <ShieldCheck size={12} /> Secure Uplink
                </div>
             </div>
             <OperatorDashboard />
          </div>
        )}

        {view === 'LINK_PAYMENT' && (
           <PaymentLinkView 
              linkId={targetLinkId}
              walletState={wallet}
              onConnect={connectWallet}
              onDisconnect={disconnectWallet}
              availableLinks={paymentLinks}
              onPay={handlePayLink}
              onClose={() => setView(UserRole.PASSENGER)}
           />
        )}

        {view === 'CHAT' && activeChatRoute && (
          <div className="max-w-4xl mx-auto">
             <RouteChat 
                route={activeChatRoute}
                walletState={wallet}
                onClose={() => setView(UserRole.PASSENGER)}
             />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className={`border-t mt-auto py-8 transition-colors ${settings.theme === 'dark' ? 'border-zinc-900' : 'border-zinc-200'}`}>
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                 <span className={`font-bold ${settings.theme === 'dark' ? 'text-zinc-300' : 'text-zinc-800'}`}>TRANSIT ARC</span>
                 <span className="text-zinc-700">|</span>
                 <p>&copy; 2025 Built on Arc Network.</p>
              </div>
              <div className="flex gap-4">
                  <a href="#" className="hover:text-indigo-500 transition-colors">Documentation</a>
                  <a href="#" className="hover:text-indigo-500 transition-colors">Privacy</a>
                  <a href="#" className="hover:text-indigo-500 transition-colors">Terms</a>
              </div>
          </div>
      </footer>
    </div>
  );
}