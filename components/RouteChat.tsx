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

  useEffect(() => {
    setMessages([{ id: '1', sender: 'System', senderAddress: '0x0', text: `Route: ${route.name}`, timestamp: Date.now(), isAi: true }]);
  }, [route]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const msg = { id: Date.now().toString(), sender: 'You', senderAddress: walletState.address || '0x', text: inputText, timestamp: Date.now() };
    setMessages(prev => [...prev, msg]);
    setInputText("");
    setIsTyping(true);
    const aiResp = await getChatCommuterMessage(route, [...messages, msg]);
    setIsTyping(false);
    setMessages(prev => [...prev, aiResp]);
  };

  return (
    <div className="flex flex-col h-[500px] bg-zinc-900 rounded-3xl border border-zinc-800">
        <div className="p-4 border-b border-zinc-800 flex justify-between">
            <button onClick={onClose}><ArrowLeft /></button>
            <h4 className="font-bold">{route.name}</h4>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(m => (
                <div key={m.id} className={`p-3 rounded-xl max-w-[80%] ${m.sender === 'You' ? 'ml-auto bg-indigo-600' : 'bg-zinc-800'}`}>
                    <p className="text-xs opacity-50 mb-1">{m.sender}</p>
                    <p className="text-sm">{m.text}</p>
                </div>
            ))}
            {isTyping && <p className="text-xs text-zinc-500 italic">Someone is typing...</p>}
        </div>
        <form onSubmit={handleSend} className="p-4 border-t border-zinc-800 flex gap-2">
            <input value={inputText} onChange={e => setInputText(e.target.value)} className="flex-1 bg-black border border-zinc-800 rounded-xl px-4" placeholder="Say something..." />
            <button type="submit" className="bg-white text-black p-2 rounded-xl"><Send size={20} /></button>
        </form>
    </div>
  );
};