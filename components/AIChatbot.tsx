import React, { useState, useRef, useEffect } from 'react';
import { getChatAssistantResponse } from '../services/geminiService.ts';
import { 
  MessageSquare, Send, X, Loader2, Sparkles, 
  Paperclip, Image as ImageIcon, Bot, User, Trash2 
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  timestamp: number;
}

export const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleImageAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAttachedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !attachedImage) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      image: attachedImage || undefined,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    const currentImg = attachedImage;
    setAttachedImage(null);
    setLoading(true);

    try {
      const base64 = currentImg ? currentImg.split(',')[1] : undefined;
      const response = await getChatAssistantResponse(input, base64);
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: 'err',
        role: 'assistant',
        content: "I'm having trouble connecting to the network.",
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-inter">
      {isOpen ? (
        <div className="w-[350px] md:w-[400px] h-[500px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 bg-zinc-900 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500 rounded-lg">
                <Bot size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Arc Assistant</h4>
                <p className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">AI_PRO_PREVIEW</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-black/20">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                <Sparkles size={32} className="mb-4 text-indigo-500" />
                <p className="text-sm">Ask me about transit routes, USDC payments, or upload a photo of a place!</p>
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                {m.image && (
                  <img src={m.image} className="w-48 h-32 object-cover rounded-xl mb-2 border border-zinc-200 dark:border-zinc-800 shadow-sm" />
                )}
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-tl-none shadow-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-2 text-zinc-500">
                <div className="p-2 bg-zinc-200 dark:bg-zinc-900 rounded-xl rounded-tl-none">
                  <Loader2 size={16} className="animate-spin" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            {attachedImage && (
              <div className="relative inline-block mb-3">
                <img src={attachedImage} className="w-16 h-16 object-cover rounded-lg border-2 border-indigo-500" />
                <button 
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 pr-10"
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-indigo-500 transition-colors"
                >
                  <ImageIcon size={18} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageAttach} />
              </div>
              <button 
                type="submit" 
                disabled={loading || (!input.trim() && !attachedImage)}
                className="p-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity" />
          <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white dark:border-black animate-pulse" />
        </button>
      )}
    </div>
  );
};