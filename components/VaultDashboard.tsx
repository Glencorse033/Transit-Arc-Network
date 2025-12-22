import React, { useState, useEffect } from 'react';
import { WalletState, VaultState, NFT } from '../types.ts';
import { generateVaultInsights } from '../services/geminiService.ts';
import { Coins, Lock, TrendingUp, Trophy, ArrowUpRight, ArrowDownLeft, Shield, Sparkles, Loader2, Star, Globe } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  walletState: WalletState;
  vaultState: VaultState;
  onUpdateVault: (newState: VaultState) => void;
  onUpdateWallet: (newBalance: number) => void;
}

export const VaultDashboard: React.FC<Props> = ({ walletState, vaultState, onUpdateVault, onUpdateWallet }) => {
  const [amount, setAmount] = useState('');
  const [insight, setInsight] = useState("Loading tips...");

  useEffect(() => {
    generateVaultInsights(vaultState.balance, vaultState.points).then(setInsight);
  }, [vaultState.balance]);

  const handleDeposit = () => {
    const val = parseFloat(amount);
    if (val > walletState.balance) return;
    onUpdateWallet(walletState.balance - val);
    onUpdateVault({ ...vaultState, balance: vaultState.balance + val });
    setAmount('');
  };

  return (
    <div className="space-y-8">
      <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex gap-3">
          <Sparkles className="text-amber-400" size={20} />
          <p className="text-sm">{insight}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-indigo-900/20 p-8 rounded-3xl border border-indigo-500/30">
              <p className="text-sm text-indigo-300">Vault Balance</p>
              <h2 className="text-4xl font-bold">${vaultState.balance.toFixed(2)}</h2>
          </div>
          <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
              <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="0.00" className="w-full bg-black border border-zinc-800 rounded-xl p-4 mb-4" />
              <button onClick={handleDeposit} className="w-full bg-white text-black py-4 rounded-xl font-bold">Deposit USDC</button>
          </div>
      </div>
    </div>
  );
};