import React, { useState } from 'react';
import { PaymentLink, WalletState } from '../types';
import { WalletButton } from './WalletButton';
import { Wallet, CheckCircle2, ArrowRight, Loader2, User } from 'lucide-react';

interface Props {
  linkId: string | null;
  walletState: WalletState;
  onConnect: () => void;
  onDisconnect: () => void;
  availableLinks: PaymentLink[];
  onPay: (linkId: string) => void;
  onClose: () => void;
}

export const PaymentLinkView: React.FC<Props> = ({ 
  linkId: initialLinkId, 
  walletState, 
  onConnect, 
  onDisconnect, 
  availableLinks,
  onPay,
  onClose
}) => {
  const [inputId, setInputId] = useState(initialLinkId || "");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const targetLink = availableLinks.find(l => l.id === inputId);

  const handlePay = () => {
    if (!targetLink) return;
    if (walletState.balance < targetLink.amount) {
        alert("Insufficient Balance");
        return;
    }

    setProcessing(true);
    setTimeout(() => {
        onPay(targetLink.id);
        setProcessing(false);
        setSuccess(true);
    }, 2500);
  };

  if (success) {
      return (
          <div className="max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-10 text-center animate-in zoom-in-95">
              <div className="w-24 h-24 bg-emerald-950/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-900">
                  <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Payment Successful!</h2>
              <p className="text-zinc-400 mb-8">
                  The ticket has been minted on Arc and sent to the passenger.
              </p>
              <button onClick={onClose} className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-zinc-200 transition-colors">
                  Return Home
              </button>
          </div>
      );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
        <button onClick={onClose} className="text-zinc-500 hover:text-white text-sm mb-4 flex items-center gap-1 transition-colors">
            ← Back
        </button>

        <div className="bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-800">
            <div className="bg-zinc-950 p-8 text-center border-b border-zinc-800">
                <h2 className="text-3xl font-bold text-white">Pay for a Trip</h2>
                <p className="text-zinc-500 mt-2">Secure peer-to-peer transit payments</p>
            </div>

            <div className="p-8">
                {!targetLink ? (
                    <div className="space-y-6">
                        <label className="block text-sm font-medium text-zinc-400">Enter Payment Link ID</label>
                        <div className="flex gap-3">
                            <input 
                                value={inputId}
                                onChange={(e) => setInputId(e.target.value)}
                                placeholder="e.g. x7z9q2"
                                className="flex-1 bg-black border border-zinc-700 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                            />
                            <button className="bg-zinc-800 px-6 rounded-xl font-bold text-white hover:bg-zinc-700 transition-colors border border-zinc-700">
                                Find
                            </button>
                        </div>
                        <p className="text-xs text-zinc-600">Try generating a link in the passenger view first.</p>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in slide-in-from-right-8">
                        <div className="bg-black p-6 rounded-2xl border border-zinc-800">
                            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-zinc-800">
                                <div className="bg-zinc-900 p-3 rounded-full text-zinc-400 border border-zinc-800">
                                    <User size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wide font-bold">Passenger</p>
                                    <p className="font-bold text-white text-lg">{targetLink.passengerName}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-500 font-medium">Total Fare</span>
                                <span className="text-3xl font-bold text-white">{targetLink.amount} USDC</span>
                            </div>
                        </div>

                        {!walletState.isConnected ? (
                             <div className="text-center space-y-4">
                                <p className="text-sm text-zinc-500">Connect your wallet to pay this fare.</p>
                                <div className="flex justify-center scale-110">
                                    <WalletButton walletState={walletState} onConnect={onConnect} onDisconnect={onDisconnect} />
                                </div>
                             </div>
                        ) : (
                            <button 
                                onClick={handlePay}
                                disabled={processing}
                                className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all flex items-center justify-center gap-3 text-lg"
                            >
                                {processing ? <Loader2 className="animate-spin" /> : <Wallet size={24} />}
                                {processing ? 'Processing Payment...' : `Pay ${targetLink.amount} USDC`}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};