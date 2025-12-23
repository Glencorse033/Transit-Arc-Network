import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket } from '../types';
import { CheckCircle2, Clock, MapPin, AlertTriangle, Ban, Copy, Check } from 'lucide-react';

interface Props {
  ticket: Ticket;
}

export const TicketCard: React.FC<Props> = ({ ticket }) => {
  const [copied, setCopied] = useState(false);
  const isExpired = new Date(ticket.expiryDate).getTime() < Date.now();
  
  const handleCopyHash = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExpired) return;
    
    navigator.clipboard.writeText(ticket.txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden w-full relative group transition-all shadow-xl ${
      isExpired ? 'opacity-70 grayscale-[0.5]' : 'hover:border-indigo-500 dark:hover:border-zinc-600'
    }`}>
      {/* Header Image */}
      <div className="h-28 w-full relative bg-zinc-100 dark:bg-black overflow-hidden">
        {ticket.imageUrl && (
            <img 
              src={ticket.imageUrl} 
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isExpired ? 'opacity-30' : 'opacity-80 dark:opacity-60 group-hover:scale-105'
              }`} 
              alt="Destination" 
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent" />
        <div className={`absolute top-0 left-0 w-full h-1 ${isExpired ? 'bg-zinc-500' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`} />
        
        {isExpired && (
          <div className="absolute top-3 right-3 bg-zinc-800/80 backdrop-blur-sm text-white px-2 py-1 rounded-md flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
            <Ban size={12} /> Invalid
          </div>
        )}

        <div className="absolute bottom-4 left-6 right-6">
            <h3 className={`text-lg font-bold leading-tight truncate ${isExpired ? 'text-zinc-500' : 'dark:text-white text-zinc-900'}`}>{ticket.routeName}</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 uppercase tracking-wider font-medium">Passenger: {ticket.passengerName}</p>
        </div>
      </div>
      
      <div className="p-6 flex flex-col items-center text-center relative">
        {/* QR Code Section */}
        <div className="relative mb-6">
          <div className={`bg-white p-4 rounded-2xl shadow-lg transition-transform border border-zinc-100 ${!isExpired && 'group-hover:scale-[1.02]'}`}>
            <QRCodeSVG 
              value={ticket.qrData} 
              size={160} 
              level="H"
              fgColor={isExpired ? "#cbd5e1" : "#000000"}
            />
            {!isExpired && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center border-4 border-white">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                 </div>
              </div>
            )}
          </div>
          
          {isExpired && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-2xl">
              <div className="rotate-[-45deg] bg-zinc-900/10 dark:bg-white/5 border-2 border-zinc-400 text-zinc-400 font-black text-4xl px-4 py-1 uppercase tracking-tighter opacity-80 scale-125 select-none">
                VOID
              </div>
            </div>
          )}
        </div>

        <div className="w-full space-y-4">
          <div className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <span className="text-zinc-500 flex items-center gap-1.5 font-medium"><Clock size={14} /> STATUS</span>
            <span className={`font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 ${
              isExpired 
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700' 
                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900'
            }`}>
              {isExpired ? (
                <>
                  <AlertTriangle size={12} />
                  EXPIRED
                </>
              ) : (
                <>
                  <CheckCircle2 size={12} />
                  ACTIVE • VALID
                </>
              )}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800 pb-3">
             <span className="text-zinc-500 font-medium">EXPIRED AT</span>
             <span className={`font-mono ${isExpired ? 'text-zinc-400' : ''}`}>
               {new Date(ticket.expiryDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </span>
          </div>
           <div className="flex justify-between items-center text-sm">
             <span className="text-zinc-500 font-medium">TX HASH</span>
             <button 
                onClick={handleCopyHash}
                disabled={isExpired}
                className={`group/btn flex items-center gap-1.5 text-xs font-mono transition-colors ${
                  isExpired 
                    ? 'text-zinc-400 cursor-not-allowed' 
                    : copied 
                      ? 'text-emerald-500' 
                      : 'text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300'
                }`}
             >
               <span className="truncate w-24 text-right">
                 {ticket.txHash}
               </span>
               {copied ? <Check size={12} /> : <Copy size={12} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />}
             </button>
          </div>
        </div>
      </div>
      
      {/* Overlay to catch and disable interactions if expired */}
      {isExpired && (
        <div className="absolute inset-0 z-10 cursor-not-allowed bg-transparent" title="This ticket has expired and is no longer valid for travel." />
      )}
    </div>
  );
};