import React, { useState } from 'react';
import { PaymentLink, WalletState } from '../types.ts';
import { WalletButton } from './WalletButton.tsx';
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

export const PaymentLinkView: React.FC<Props> = ({ linkId, walletState, onConnect, onDisconnect, availableLinks, onPay, onClose }) => {
  const [success, setSuccess] = useState(false);
  const targetLink = availableLinks.find(l => l.id === linkId);

  if (success) {
      return (
          <div className="max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-10 text-center">
              <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Paid!</h2>
              <button onClick={onClose} className="bg-white text-black py-2 px-6 rounded-xl font-bold">Done</button>
          </div>
      );
  }

  return (
    <div className="max-w-xl mx-auto p-8 bg-zinc-900 rounded-3xl border border-zinc-800">
        <h2 className="text-2xl font-bold mb-6">Payment Portal</h2>
        {targetLink ? (
            <div className="space-y-4">
                <div className="bg-black p-4 rounded-xl border border-zinc-800">
                    <p className="text-xs text-zinc-500">PAYING FOR</p>
                    <p className="font-bold">{targetLink.passengerName}</p>
                    <p className="text-xl font-bold mt-2">{targetLink.amount} USDC</p>
                </div>
                <button onClick={() => { onPay(targetLink.id); setSuccess(true); }} className="w-full bg-white text-black py-4 rounded-xl font-bold">Pay Now</button>
            </div>
        ) : <p className="text-zinc-500">No payment link selected.</p>}
    </div>
  );
};