import React, { useState, useEffect } from 'react';
import { Wallet, Info, ArrowDown, Zap } from 'lucide-react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';

const Presale = () => {
  const [solAmount, setSolAmount] = useState('');
  const [lxAmount, setLxAmount] = useState(0);
  const { address, isConnected, caipAddress, status, embeddedWalletInfo } =
      useAppKitAccount();
    const { open, close } = useAppKit();

  // Constants for the presale logic
  const SOL_PRICE = 145; // Hypothetical SOL price in USD
  const LX_PRICE = 0.05; // LX token price in USD
  const EXCHANGE_RATE = 25000; // 1 SOL = 2900 LX (Calculated: 145 / 0.05)

  const handleConnect = () => {
    if (isConnected) {
      open({ view: "Account" });
    } else {
      open({ view: "Connect", namespace: "solana" });
    }
  }

  useEffect(() => {
    if (solAmount > 0) {
      setLxAmount((solAmount * EXCHANGE_RATE).toLocaleString());
    } else {
      setLxAmount(0);
    }
  }, [solAmount]);

  return (
    <div id='presale' className="min-h-screen bg-[#072542] text-white flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-white">
              LX Presale
            </h1>
            {/* <p className="text-gray-400 text-sm">Round 1: Live Now</p> */}
          </div>
          {/* <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Active
          </div> */}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs mb-2 text-gray-400">
            <span>Progress: 65%</span>
            <span>Hard Cap: 5,000 SOL</span>
          </div>
          <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 h-full w-[65%] rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 transition-all focus-within:border-purple-500/50">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>You Pay</span>
              <span>Balance: 0.00 SOL</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="0.0"
                className="bg-transparent text-2xl font-semibold outline-none w-full"
                value={solAmount}
                onChange={(e) => setSolAmount(e.target.value)}
              />
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl">
                <div className="w-6 h-6 bg-gradient-to-br from-[#14F195] to-[#9945FF] rounded-full"></div>
                <span className="font-bold">SOL</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-6 relative z-10">
            <div className="bg-[#1e293b] border border-white/10 p-2 rounded-full shadow-lg">
              <ArrowDown size={20} className="text-purple-400" />
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>You Receive</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                readOnly
                className="bg-transparent text-2xl font-semibold outline-none w-full text-gray-300"
                value={lxAmount}
                placeholder="0"
              />
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-purple-500/30">
                <Zap size={18} className="text-purple-400 fill-purple-400" />
                <span className="font-bold text-purple-400">LX</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details List */}
        <div className="mt-8 space-y-3 bg-black/20 rounded-2xl p-4 text-sm border border-white/5">
          <div className="flex justify-between text-gray-400">
            <span>Price</span>
            <span className="text-white">1 LX = $0.05</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Exchange Rate</span>
            <span className="text-white">1 SOL ≈ 2,900 LX</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Slippage</span>
            <span className="text-white">0.5%</span>
          </div>
        </div>

        {/* Action Button */}
        <button 
            className="cursor-pointer w-full mt-8 bg-white/90 hover:bg-white backdrop-blur-3xl text-[#072542] py-4 rounded-2xl font-bold text-lg transition-all transform active:scale-[0.98] shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2"
            onClick={()=>handleConnect()}
        >
          <Wallet size={20} />
          {isConnected ? `${address.slice(0,4)}...${address.slice(-4)}` : "Connect Wallet"}
        </button>

        {/* Footer Info */}
        <div className="mt-6 flex items-start gap-2 text-[10px] text-gray-500 leading-relaxed uppercase tracking-widest text-center justify-center">
          <Info size={12} className="mt-0.5" />
          <span>Listing price will be $0.02. Buy now for 2.4x gains.</span>
        </div>
      </div>
    </div>
  );
};

export default Presale;