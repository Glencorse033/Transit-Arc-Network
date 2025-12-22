import React, { useState, useEffect, useRef } from 'react';
import { TransitRoute, ChatMessage, WalletState } from '../types';
import { getChatCommuterMessage } from '../services/geminiService';
import { Send, Users, MessageSquare, ArrowLeft, ShieldCheck, Loader2, Sparkles, UserCircle } from 'lucide-react';

interface Props {
  route: TransitRoute;
  walletState: WalletState;
  onClose: () => void;
}

export const RouteChat: React.FC<Props> = ({ route, walletState, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial welcome message and some history
  useEffect(() => {
    const initialMessages: ChatMessage[] = [
      {
        id: '1',
        sender: 'System',
        senderAddress: '0x000...000',
        text: `Welcome to the ${route.name} community channel. Connect with fellow commuters traveling from ${route.origin} to ${route.destination}.`,
        timestamp: Date.now() - 100000,
        isAi: true
      }
    ];
    setMessages(initialMessages);
  }, [route]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sender: walletState.isConnected ? 'You' : 'Anonymous',
      senderAddress: walletState.address || '0x...',
      text: inputText,
      timestamp: Date.now(),
      isAi: false
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    
    // Simulate someone else responding after a short delay
    setIsTyping(true);
    setTimeout(async () => {
      const response = await getChatCommuterMessage(route, [...messages, userMsg]);
      setIsTyping(false);
      setMessages(prev => [...prev, response]);
    }, 2000 + Math.random() * 2000);
  };

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-black/20">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
               {route.name}
               <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded-md font-mono">ENCRYPTED</span>
            </h3>
            <p className="text-xs text-zinc-500 flex items-center gap-1">
              <Users size={12} /> 12 commuters online
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-indigo-500">
          <ShieldCheck size={14} /> Arc Community Protocol v1.0
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Online Commuters */}
        <div className="hidden md:flex flex-col w-48 border-r border-zinc-100 dark:border-zinc-800 p-4 space-y-4 bg-zinc-50/50 dark:bg-black/10">
           <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Commuters</h4>
           <div className="space-y-3 overflow-y-auto">
              {['TechTraveler', 'Satoshi_99', 'BlockRider', 'CryptoCommute', 'Web3_Wanderer'].map((user, i) => (
                <div key={user} className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                   <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{user}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 flex flex-col relative">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
          >
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
                    {msg.sender} 
                    <span className="ml-1 opacity-50 font-normal lowercase">{msg.senderAddress}</span>
                  </span>
                </div>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-all ${
                  msg.sender === 'System' 
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-center mx-auto max-w-full font-mono italic text-[11px]' 
                    : msg.sender === 'You'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-tl-none border border-zinc-200 dark:border-zinc-700'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[9px] text-zinc-400 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-center gap-2 text-zinc-400 animate-pulse px-1">
                <Loader2 size={12} className="animate-spin" />
                <span className="text-[10px] font-mono">COMMUTER_IS_TYPING...</span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form 
            onSubmit={handleSendMessage}
            className="p-4 bg-zinc-50 dark:bg-black/40 border-t border-zinc-200 dark:border-zinc-800"
          >
            <div className="relative">
              <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Share an update or say hi..."
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-5 py-3 pr-12 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="absolute right-2 top-1.5 p-2 bg-indigo-600 text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:grayscale"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2 px-1">
               <Sparkles size={10} className="text-amber-500" />
               <p className="text-[9px] text-zinc-500 font-medium">Keep it friendly! Transit Arc community is powered by decentralized trust.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};