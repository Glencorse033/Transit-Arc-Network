import React, { useEffect, useState } from 'react';
import { generateAnalytics } from '../services/geminiService';
import { AnalyticsData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Wallet, Activity, ScanLine, Loader2, Globe, Server, CheckCircle2 } from 'lucide-react';

export const OperatorDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'scanner' | 'network'>('overview');

  useEffect(() => {
    const fetchData = async () => {
      const result = await generateAnalytics();
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-zinc-500 space-y-2">
            <Loader2 className="animate-spin text-white" />
            <p className="text-sm font-mono">INITIALIZING_DASHBOARD...</p>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-zinc-500 font-medium uppercase tracking-wide">Total Revenue</p>
                        <h3 className="text-3xl font-bold text-white mt-1">${data.totalRevenue.toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-zinc-800 text-indigo-400 rounded-xl">
                        <Wallet size={20} />
                    </div>
                </div>
                <div className="mt-4 text-xs text-emerald-400 flex items-center gap-1 font-mono">
                    <TrendingUp size={12} /> +12% GROWTH
                </div>
            </div>

            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-zinc-500 font-medium uppercase tracking-wide">Active Riders</p>
                        <h3 className="text-3xl font-bold text-white mt-1">{data.activeRiders}</h3>
                    </div>
                    <div className="p-3 bg-zinc-800 text-blue-400 rounded-xl">
                        <Users size={20} />
                    </div>
                </div>
                 <div className="mt-4 text-xs text-blue-400 flex items-center gap-1 font-mono">
                    <Activity size={12} /> LIVE NETWORK ACTIVITY
                </div>
            </div>
            
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 md:col-span-1 cursor-pointer hover:border-indigo-500/50 transition-colors group" onClick={() => setActiveTab('scanner')}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-zinc-500 font-medium uppercase tracking-wide">Validator</p>
                        <h3 className="text-xl font-bold text-white mt-1 group-hover:text-indigo-400 transition-colors">Launch Scanner</h3>
                    </div>
                    <div className="p-3 bg-zinc-800 text-purple-400 rounded-xl">
                        <ScanLine size={20} />
                    </div>
                </div>
                <p className="mt-4 text-xs text-zinc-500">Access camera terminal</p>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-zinc-800">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'overview' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                Overview
                {activeTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-full" />}
            </button>
            <button 
                onClick={() => setActiveTab('scanner')}
                className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'scanner' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                Ticket Validator
                {activeTab === 'scanner' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-full" />}
            </button>
            <button 
                onClick={() => setActiveTab('network')}
                className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'network' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                Network Status
                {activeTab === 'network' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-full" />}
            </button>
        </div>

        {activeTab === 'overview' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                    <h4 className="font-semibold text-white mb-6">Revenue Trend (7 Days)</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.dailyRevenue}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#71717a'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 12, fill: '#71717a'}} axisLine={false} tickLine={false} prefix="$" />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff'}}
                                    itemStyle={{color: '#fff'}}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                     <h4 className="font-semibold text-white mb-6">Top Routes</h4>
                     <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={data.popularRoutes}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#27272a" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11, fill: '#a1a1aa'}} />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}} 
                                    contentStyle={{backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff'}}
                                />
                                <Bar dataKey="ticketsSold" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                     </div>
                </div>
            </div>
        )}
        
        {activeTab === 'scanner' && (
            <div className="bg-zinc-900 p-12 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-80 h-80 bg-black rounded-3xl flex items-center justify-center relative overflow-hidden group border border-zinc-700 shadow-2xl">
                     <div className="absolute inset-0 border-2 border-emerald-500/50 m-8 rounded-xl animate-pulse"></div>
                     <div className="w-full h-1 bg-red-500/80 absolute top-0 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_#ef4444]"></div>
                     <ScanLine className="text-zinc-700" size={80} />
                     <p className="absolute bottom-6 text-emerald-500 text-xs font-mono tracking-widest">LIVE FEED_01</p>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Scan Ticket QR</h3>
                    <p className="text-zinc-400 text-sm mt-1">Point terminal at passenger ticket to validate via Arc chain.</p>
                </div>
                <div className="flex gap-3 w-full max-w-md mt-4">
                     <input type="text" placeholder="Or enter Ticket Hash manually" className="flex-1 bg-black border border-zinc-700 rounded-xl px-5 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                     <button className="bg-white text-black px-6 py-3 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors">Validate</button>
                </div>
            </div>
        )}

        {activeTab === 'network' && (
             <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-indigo-500/10 p-3 rounded-xl text-indigo-400 border border-indigo-500/20">
                        <Globe size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Arc Network Deployment</h3>
                        <p className="text-sm text-zinc-400">Smart Contract status and node telemetry</p>
                    </div>
                    <div className="ml-auto bg-emerald-950/30 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-emerald-900/50">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                        SYSTEM OPERATIONAL
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="bg-black p-5 rounded-xl border border-zinc-800 flex justify-between items-center group hover:border-zinc-700 transition-colors">
                            <div>
                                <p className="text-xs text-zinc-500 uppercase tracking-wide font-bold mb-1">Core Contract</p>
                                <span className="font-mono text-sm text-zinc-300 group-hover:text-white transition-colors">0x71C...9A23</span>
                            </div>
                            <CheckCircle2 size={18} className="text-emerald-500" />
                        </div>
                        <div className="bg-black p-5 rounded-xl border border-zinc-800 flex justify-between items-center group hover:border-zinc-700 transition-colors">
                            <div>
                                <p className="text-xs text-zinc-500 uppercase tracking-wide font-bold mb-1">Vault Contract</p>
                                <span className="font-mono text-sm text-zinc-300 group-hover:text-white transition-colors">0xB4F...22E1</span>
                            </div>
                             <CheckCircle2 size={18} className="text-emerald-500" />
                        </div>
                         <div className="bg-black p-5 rounded-xl border border-zinc-800 flex justify-between items-center group hover:border-zinc-700 transition-colors">
                             <div>
                                <p className="text-xs text-zinc-500 uppercase tracking-wide font-bold mb-1">USDC Bridge (Arc)</p>
                                <span className="font-mono text-sm text-zinc-300 group-hover:text-white transition-colors">0x88A...11B2</span>
                             </div>
                             <CheckCircle2 size={18} className="text-emerald-500" />
                        </div>
                    </div>

                    <div className="bg-black text-zinc-400 p-6 rounded-xl font-mono text-xs overflow-hidden relative border border-zinc-800">
                         <div className="absolute top-4 right-4 text-zinc-700">
                            <Server size={18} />
                         </div>
                         <p className="text-emerald-500 mb-3">$ status check --network arc</p>
                         <div className="space-y-2">
                            <p>> Connecting to RPC https://5042002.rpc.thirdweb.com...</p>
                            <p>> Chain ID: <span className="text-white">5042002</span></p>
                            <p>> Native Token: <span className="text-white">USDC</span></p>
                            <p>> Block Height: <span className="text-white">14,242,189</span></p>
                            <p>> Gas Price: 0.000002 USDC</p>
                            <p>> Explorer: <a href="https://testnet.arcscan.app" className="text-indigo-400 underline decoration-indigo-500/30">https://testnet.arcscan.app</a></p>
                            <p className="text-indigo-400 mt-4 border-t border-zinc-800 pt-2">All systems operational.</p>
                         </div>
                    </div>
                </div>
             </div>
        )}
    </div>
  );
};