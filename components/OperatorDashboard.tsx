import React, { useEffect, useState } from 'react';
import { generateAnalytics } from '../services/geminiService.ts';
import { AnalyticsData } from '../types.ts';
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-zinc-500 font-medium uppercase tracking-wide">Total Revenue</p>
                        <h3 className="text-3xl font-bold text-white mt-1">${data.totalRevenue.toLocaleString()}</h3>
                    </div>
                    <div className="p-3 bg-zinc-800 text-indigo-400 rounded-xl"><Wallet size={20} /></div>
                </div>
            </div>
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-zinc-500 font-medium uppercase tracking-wide">Active Riders</p>
                        <h3 className="text-3xl font-bold text-white mt-1">{data.activeRiders}</h3>
                    </div>
                    <div className="p-3 bg-zinc-800 text-blue-400 rounded-xl"><Users size={20} /></div>
                </div>
            </div>
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 cursor-pointer" onClick={() => setActiveTab('scanner')}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-zinc-500 font-medium uppercase tracking-wide">Validator</p>
                        <h3 className="text-xl font-bold text-white mt-1">Scanner</h3>
                    </div>
                    <div className="p-3 bg-zinc-800 text-purple-400 rounded-xl"><ScanLine size={20} /></div>
                </div>
            </div>
        </div>

        <div className="flex gap-6 border-b border-zinc-800">
            {['overview', 'scanner', 'network'].map((tab: any) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-white' : 'text-zinc-500'}`}>
                    {tab.toUpperCase()}
                    {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-full" />}
                </button>
            ))}
        </div>

        {activeTab === 'overview' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.dailyRevenue}>
                            <XAxis dataKey="date" tick={{fontSize: 10}} />
                            <Area type="monotone" dataKey="amount" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}
    </div>
  );
};