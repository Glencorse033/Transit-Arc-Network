
import React, { useState, useEffect } from 'react';
import { Wallet, Loader2, LogOut, ExternalLink } from 'lucide-react';
import { WalletState } from '../types';

interface Props {
  walletState: WalletState;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const WalletButton: React.FC<Props> = ({ walletState, onConnect, onDisconnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (typeof (window as any).ethereum === 'undefined') {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);
    try {
      // Trigger the real wallet connection
      await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      onConnect();
    } catch (error) {
      console.error("User rejected the connection or error occurred:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (walletState.isConnected) {
    return (
      <div className="flex items-center gap-2">
        {/* Network Badge */}
        <div className="hidden md:flex items-center gap-1.5 bg-zinc-900 dark:bg-zinc-900 text-indigo-400 px-3 py-1.5 rounded-full text-xs font-bold border border-zinc-200 dark:border-zinc-800 mr-2 shadow-sm">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse" />
            Connected
        </div>

        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white px-4 py-2 rounded-full text-sm font-medium border border-zinc-200 dark:border-zinc-800 transition-colors shadow-sm">
            <span className="font-mono text-zinc-500 dark:text-zinc-400">
              {walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}
            </span>
            <span className="text-zinc-300 dark:text-zinc-600 mx-2">|</span>
            <span className="font-bold">{walletState.balance.toFixed(4)} ETH</span>
            <button 
              onClick={onDisconnect}
              className="ml-3 text-zinc-400 hover:text-red-500 transition-colors"
              title="Disconnect"
            >
              <LogOut size={14} />
            </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="group relative flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-indigo-50 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
    >
      {isConnecting ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
      {isConnecting ? 'Approving...' : (window as any).ethereum ? 'Connect Wallet' : 'Install Wallet'}
    </button>
  );
};
