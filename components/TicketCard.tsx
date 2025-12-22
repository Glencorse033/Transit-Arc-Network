import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket } from '../types';
import { CheckCircle2, Clock, MapPin } from 'lucide-react';

interface Props {
  ticket: Ticket;
}

export const TicketCard: React.FC<Props> = ({ ticket }) => {
  const isExpired = new Date(ticket.expiryDate).getTime() < Date.now();
  
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden w-full relative group hover:border-indigo-500 dark:hover:border-zinc-600 transition-all shadow-xl">
      {/* Header Image */}
      <div className="h-28 w-full relative bg-zinc-100 dark:bg-black overflow-hidden">
        {ticket.imageUrl && (
            <img src={ticket.imageUrl} className="w-full h-full object-cover opacity-80 dark:opacity-60 group-hover:scale-105 transition-transform duration-700" alt="Destination" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent" />
        <div className={`absolute top-0 left-0 w-full h-1 ${isExpired ? 'bg-zinc-400' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`} />
        
        <div className="absolute bottom-4 left-6 right-6">
            <h3 className="text-lg font-bold dark:text-white text-zinc-900 leading-tight truncate">{ticket.routeName}</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 uppercase tracking-wider font-medium">Passenger: {ticket.passengerName}</p>
        </div>
      </div>
      
      <div className="p-6 flex flex-col items-center text-center">
        
        <div className="bg-white p-4 rounded-2xl shadow-lg mb-6 relative group-hover:scale-[1.02] transition-transform border border-zinc-100">
          <QRCodeSVG 
            value={ticket.qrData} 
            size={160} 
            level="H"
            fgColor={isExpired ? "#94a3b8" : "#000000"}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center border-4 border-white">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
             </div>
          </div>
        </div>

        <div className="w-full space-y-4">
          <div className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <span className="text-zinc-500 flex items-center gap-1.5 font-medium"><Clock size={14} /> STATUS</span>
            <span className={`font-bold px-3 py-1 rounded-full text-xs ${
              isExpired 
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500' 
                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900'
            }`}>
              {isExpired ? 'EXPIRED' : 'ACTIVE • VALID'}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800 pb-3">
             <span className="text-zinc-500 font-medium">EXPIRES</span>
             <span className="font-mono">
               {new Date(ticket.expiryDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </span>
          </div>
           <div className="flex justify-between items-center text-sm">
             <span className="text-zinc-500 font-medium">TX HASH</span>
             <span className="text-indigo-500 dark:text-indigo-400 text-xs truncate w-32 text-right font-mono">
               {ticket.txHash}
             </span>
          </div>
        </div>
      </div>
    </div>
  );
};