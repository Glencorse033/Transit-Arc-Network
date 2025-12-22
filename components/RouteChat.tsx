import React, { useState, useEffect, useRef } from 'react';
import { TransitRoute, ChatMessage, WalletState } from '../types.ts';
import { getChatCommuterMessage } from '../services/geminiService.ts';
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

  useEffect(() => {
    setMessages([{ 
      id: '1', 
      sender: 'System', 
      senderAddress: '0x0', 
      text: `Connected to ${route.name} community. Stay respectful!`, 
      timestamp: Date.now(), 
      isAi: true 
    }]);
  }, [route]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const msg: ChatMessage = { id: Date.now().toString(), sender: 'You', senderAddress: walletState.address || '0x', text: inputText, timestamp: Date.now() };
    setMessages(prev => [...prev, msg]);
    setInputText("");
    setIsTyping(true);
    const aiResp = await getChatCommuterMessage(route, [...messages, msg]);
    setIsTyping(false);
    setMessages(prev => [...prev, aiResp]);
  };

  return (
    <div className="flex flex-col h-[550px] md:h-[600px] max-h-[85vh] bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-4 md:p-5 border-b border-zinc-800 flex items-center gap-3 bg-zinc-950/50">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 overflow-hidden">
                <h4 className="font-bold text-sm md:text-base text-white truncate">{route.name} Chat</h4>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                   <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">12 Active Commuters</span>
                </div>
            </div>
            <Users size={18} className="text-zinc-600" />
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        >
            {messages.map(m => (
                <div key={m.id} className={`flex flex-col ${m.sender === 'You' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] md:max-w-[80%] text-sm shadow-sm ${
                      m.sender === 'You' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : m.sender === 'System'
                      ? 'bg-zinc-800/50 text-zinc-400 border border-zinc-800 italic text-[11px] py-1 mx-auto max-w-full rounded-full'
                      : 'bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700/50'
                    }`}>
                        {m.sender !== 'You' && m.sender !== 'System' && (
                          <p className="text-[10px] font-black text-indigo-400 mb-1 uppercase tracking-tighter">{m.sender}</p>
                        )}
                        <p className="leading-relaxed">{m.text}</p>
                    </div>
                    {m.sender !== 'System' && (
                      <span className="text-[8px] text-zinc-600 mt-1 uppercase font-mono">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                </div>
            ))}
            {isTyping && (
                <div className="flex items-center gap-2 text-zinc-500">
                    <div className="flex gap-1">
                       <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                       <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                       <span className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Commuter typing...</span>
                </div>
            )}
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-zinc-800 bg-zinc-950/50 flex gap-2">
            <input 
              value={inputText} 
              onChange={e => setInputText(e.target.value)} 
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none placeholder:text-zinc-600" 
              placeholder="Join the conversation..." 
            />
            <button 
              type="submit" 
              disabled={!inputText.trim()}
              className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
        </form>
    </div>
  );
};
