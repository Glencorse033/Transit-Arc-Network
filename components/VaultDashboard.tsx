import React, { useState, useEffect } from 'react';
import { WalletState, VaultState, NFT } from '../types';
import { generateVaultInsights } from '../services/geminiService';
import { Coins, Lock, TrendingUp, Trophy, ArrowUpRight, ArrowDownLeft, Shield, Sparkles, Loader2, Star, Globe } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  walletState: WalletState;
  vaultState: VaultState;
  onUpdateVault: (newState: VaultState) => void;
  onUpdateWallet: (newBalance: number) => void;
}

export const VaultDashboard: React.FC<Props> = ({ walletState, vaultState, onUpdateVault, onUpdateWallet }) => {
  const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
  const [amount, setAmount] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [insight, setInsight] = useState<string>("Loading personal finance tips...");
  const [selectedLock, setSelectedLock] = useState<'NONE' | '30_DAYS' | '90_DAYS' | '1_YEAR'>('NONE');

  useEffect(() => {
    generateVaultInsights(vaultState.balance, vaultState.points).then(setInsight);
  }, [vaultState.balance]);

  // Mock Projection Data
  const projectionData = [
    { month: 'Jan', value: vaultState.balance },
    { month: 'Feb', value: vaultState.balance * (1 + (vaultState.apy / 1200)) },
    { month: 'Mar', value: vaultState.balance * (1 + (vaultState.apy / 1200) * 2) },
    { month: 'Apr', value: vaultState.balance * (1 + (vaultState.apy / 1200) * 3) },
    { month: 'May', value: vaultState.balance * (1 + (vaultState.apy / 1200) * 4) },
    { month: 'Jun', value: vaultState.balance * (1 + (vaultState.apy / 1200) * 5) },
  ];

  const handleTransaction = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    if (activeTab === 'DEPOSIT') {
      if (val > walletState.balance) {
        alert("Insufficient Wallet Balance");
        return;
      }
      setProcessing(true);
      setTimeout(() => {
        const newBalance = vaultState.balance + val;
        
        // Check for NFT Unlocks
        const newNfts = [...vaultState.nfts];
        if (newBalance >= 50 && !newNfts.find(n => n.tier === 'BRONZE')) {
            newNfts.push({ 
                id: 'nft-bronze', name: 'Bronze Pass', description: 'Entry level transit access', 
                tier: 'BRONZE', imageUrl: 'https://images.unsplash.com/photo-1610375461246-83c485099f10?w=400&q=80', dateEarned: new Date().toISOString() 
            });
        }
        if (newBalance >= 200 && !newNfts.find(n => n.tier === 'SILVER')) {
             newNfts.push({ 
                id: 'nft-silver', name: 'Silver Commuter', description: 'Pro traveler status', 
                tier: 'SILVER', imageUrl: 'https://images.unsplash.com/photo-1610375461369-d612b120f6ca?w=400&q=80', dateEarned: new Date().toISOString() 
            });
        }
         if (newBalance >= 500 && !newNfts.find(n => n.tier === 'GOLD')) {
             newNfts.push({ 
                id: 'nft-gold', name: 'Gold Class', description: 'Elite transit privileges', 
                tier: 'GOLD', imageUrl: 'https://images.unsplash.com/photo-1610375461257-d72dd254859a?w=400&q=80', dateEarned: new Date().toISOString() 
            });
        }

        // Calculate Points Multiplier based on lock
        let multiplier = 1;
        if (selectedLock === '30_DAYS') multiplier = 1.5;
        if (selectedLock === '90_DAYS') multiplier = 2;
        if (selectedLock === '1_YEAR') multiplier = 3;

        onUpdateWallet(walletState.balance - val);
        onUpdateVault({
          ...vaultState,
          balance: newBalance,
          points: vaultState.points + (val * multiplier),
          nfts: newNfts,
          lockPeriod: selectedLock !== 'NONE' ? selectedLock : vaultState.lockPeriod
        });
        setAmount('');
        setProcessing(false);
      }, 2000);
    } else {
       if (val > vaultState.balance) {
        alert("Insufficient Vault Funds");
        return;
      }
      setProcessing(true);
      setTimeout(() => {
        onUpdateWallet(walletState.balance + val);
        onUpdateVault({
          ...vaultState,
          balance: vaultState.balance - val,
        });
        setAmount('');
        setProcessing(false);
      }, 2000);
    }
  };

  const getLockAPY = (lock: string) => {
      switch(lock) {
          case 'NONE': return 4.5;
          case '30_DAYS': return 6.2;
          case '90_DAYS': return 8.5;
          case '1_YEAR': return 12.0;
          default: return 4.5;
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* AI Insight Banner */}
      <div className="bg-zinc-900 rounded-2xl p-4 text-white shadow-lg flex items-start gap-3 border border-zinc-800">
         <Sparkles className="shrink-0 mt-1 text-amber-300" size={20} />
         <div>
             <h3 className="font-bold text-sm uppercase tracking-wider opacity-60 text-amber-300 mb-1">Arc AI Advisor</h3>
             <p className="font-medium text-zinc-100">{insight}</p>
         </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-900 to-black rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group border border-indigo-900/50">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield size={120} />
            </div>
            <div className="flex justify-between items-start mb-2">
                <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider">Total Vault Balance</p>
                <div className="text-[10px] bg-black/40 border border-white/10 px-2 py-0.5 rounded text-white flex items-center gap-1 backdrop-blur-md">
                    <Globe size={10} /> Arc Chain
                </div>
            </div>
            
            <h2 className="text-5xl font-bold mb-4 tracking-tighter">${vaultState.balance.toFixed(2)}</h2>
            <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-950/30 border border-emerald-900/50 w-fit px-3 py-1.5 rounded-full">
                <TrendingUp size={14} /> 
                <span className="font-mono">{vaultState.apy}% APY</span>
            </div>
            <p className="mt-6 text-xs text-indigo-300/60 font-mono">ASSET: USYC (YIELD BEARING)</p>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-xl relative overflow-hidden">
             <div className="absolute -right-6 -bottom-6 text-zinc-800 opacity-50 rotate-12">
                <Star size={140} strokeWidth={1.5} />
            </div>
            <p className="text-zinc-500 text-sm font-medium mb-2 uppercase tracking-wider">Loyalty Points</p>
            <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">{vaultState.points.toLocaleString()}</h2>
            <p className="text-sm text-zinc-400">
                <span className="text-white font-bold">{vaultState.lockPeriod === 'NONE' ? '1x' : vaultState.lockPeriod === '30_DAYS' ? '1.5x' : vaultState.lockPeriod === '90_DAYS' ? '2x' : '3x'}</span> Multiplier Active
            </p>
            <div className="mt-6 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[60%] shadow-[0_0_10px_#6366f1]" />
            </div>
            <p className="text-xs text-zinc-600 mt-2 font-mono">400 PTS TO NEXT TIER</p>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-xl">
             <p className="text-zinc-500 text-sm font-medium mb-2 uppercase tracking-wider">Yield Earned</p>
             <h2 className="text-4xl font-bold text-emerald-400 mb-2 tracking-tight">+${vaultState.yieldEarned.toFixed(2)}</h2>
             <div className="h-24 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData}>
                         <defs>
                            <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip 
                            contentStyle={{backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff'}}
                            itemStyle={{color: '#fff'}}
                        />
                        <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#colorYield)" />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Action Panel */}
          <div className="lg:col-span-1 bg-zinc-900 rounded-3xl shadow-xl border border-zinc-800 p-8">
               <div className="flex bg-black p-1.5 rounded-xl mb-8 border border-zinc-800">
                   <button 
                    onClick={() => setActiveTab('DEPOSIT')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'DEPOSIT' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                   >
                    Deposit
                   </button>
                   <button 
                    onClick={() => setActiveTab('WITHDRAW')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'WITHDRAW' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                   >
                    Withdraw
                   </button>
               </div>

               <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Amount (USDC)</label>
                        <div className="relative group">
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-black border border-zinc-700 rounded-xl px-5 py-4 pl-12 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-lg placeholder-zinc-700 transition-all group-hover:border-zinc-600"
                                placeholder="0.00"
                            />
                            <div className="absolute left-4 top-5 text-zinc-500 group-focus-within:text-indigo-500 transition-colors">
                                <Coins size={20} />
                            </div>
                            <button 
                                onClick={() => setAmount(activeTab === 'DEPOSIT' ? walletState.balance.toString() : vaultState.balance.toString())}
                                className="absolute right-4 top-4 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg border border-zinc-700"
                            >
                                MAX
                            </button>
                        </div>
                        <p className="text-xs text-zinc-500 mt-2 text-right">
                            Available: <span className="text-white">{activeTab === 'DEPOSIT' ? walletState.balance.toFixed(2) : vaultState.balance.toFixed(2)} USDC</span>
                        </p>
                    </div>

                    {activeTab === 'DEPOSIT' && (
                        <div>
                             <label className="block text-sm font-medium text-zinc-400 mb-3">Lock Period (Bonus Multiplier)</label>
                             <div className="grid grid-cols-2 gap-3">
                                {(['NONE', '30_DAYS', '90_DAYS', '1_YEAR'] as const).map((period) => (
                                    <button 
                                        key={period}
                                        onClick={() => setSelectedLock(period)}
                                        className={`px-3 py-3 rounded-xl text-xs font-medium border text-center transition-all ${selectedLock === period 
                                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                                            : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-600 hover:bg-zinc-800'}`}
                                    >
                                        <div className="font-bold mb-1">
                                            {period === 'NONE' ? 'No Lock' : period.replace('_', ' ')}
                                        </div>
                                        <div className="text-[10px] opacity-80 font-mono">
                                            {getLockAPY(period)}% APY
                                        </div>
                                    </button>
                                ))}
                             </div>
                        </div>
                    )}

                    <button 
                        onClick={handleTransaction}
                        disabled={processing || !amount}
                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg ${activeTab === 'DEPOSIT' ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700'}`}
                    >
                         {processing ? <Loader2 className="animate-spin" /> : (activeTab === 'DEPOSIT' ? <ArrowDownLeft /> : <ArrowUpRight />)}
                         {processing ? 'Processing...' : `${activeTab} USDC`}
                    </button>
               </div>
          </div>

          {/* Trophy Case (NFTs) */}
          <div className="lg:col-span-2 space-y-6">
              <h3 className="font-bold text-white text-xl flex items-center gap-2">
                  <Trophy className="text-amber-400" /> Collection & Rewards
              </h3>
              
              {vaultState.nfts.length === 0 ? (
                  <div className="bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-3xl h-80 flex flex-col items-center justify-center text-zinc-600">
                      <Lock size={48} className="mb-4 opacity-50" />
                      <p className="font-medium text-lg">No rewards unlocked yet</p>
                      <p className="text-sm">Deposit $50 to unlock your first NFT!</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {vaultState.nfts.map(nft => (
                          <div key={nft.id} className="bg-zinc-900 rounded-2xl shadow-lg border border-zinc-800 overflow-hidden flex group hover:border-indigo-500/50 transition-colors">
                               <div className="w-28 h-28 bg-zinc-800 shrink-0">
                                   <img src={nft.imageUrl} alt={nft.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                               </div>
                               <div className="p-5 flex flex-col justify-center">
                                   <div className={`text-[10px] font-bold px-2 py-0.5 rounded border w-fit mb-2 tracking-wider ${
                                       nft.tier === 'GOLD' ? 'bg-amber-950/30 text-amber-400 border-amber-900' : 
                                       nft.tier === 'SILVER' ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 
                                       'bg-orange-950/30 text-orange-400 border-orange-900'
                                   }`}>
                                       {nft.tier} TIER
                                   </div>
                                   <h4 className="font-bold text-white text-lg">{nft.name}</h4>
                                   <p className="text-xs text-zinc-500 mt-1">{nft.description}</p>
                               </div>
                          </div>
                      ))}
                      
                      {/* Next Tier Teaser */}
                      <div className="bg-black rounded-2xl border-2 border-dashed border-zinc-800 flex items-center justify-center p-6 text-center opacity-70">
                          <div>
                              <p className="text-sm font-bold text-zinc-500">Next Unlock</p>
                              <p className="text-xs text-zinc-600 mt-1">Keep depositing to reveal</p>
                          </div>
                      </div>
                  </div>
              )}

               <div className="bg-gradient-to-r from-amber-900/20 to-amber-800/20 border border-amber-900/30 rounded-2xl p-6 text-white flex justify-between items-center">
                  <div>
                      <h4 className="font-bold text-lg text-amber-200">Premium Commuter Status</h4>
                      <p className="text-amber-200/60 text-sm">Unlock 10% off all fares with Gold Tier NFT</p>
                  </div>
                  <div className="h-14 w-14 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                      <Star className="text-amber-400" fill="currentColor" size={24} />
                  </div>
               </div>
          </div>
      </div>
    </div>
  );
};