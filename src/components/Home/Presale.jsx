import React, { useState, useEffect } from 'react';
import { Wallet, Info, ArrowDown, Zap, ArrowRight } from 'lucide-react';
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
    <div id='presale' className="py-20 bg-secondary text-tertiary flex items-center justify-center p-6 font-sans">
      <div className="relative w-full max-w-5xl bg-tertiary/5 backdrop-blur-xl border border-tertiary/10 rounded-3xl px-8 py-12 shadow-2xl">
        
        {/* <video className='absolute w-full h-full top-0 left-0 object-cover -z-1 rounded-3xl opacity-20'  autoPlay loop muted>
          <source src="/LAUNCHX-VIDEO.mp4" type="video/mp4" />
        </video> */}

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-tertiary">
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
          <div className="flex justify-between text-xs mb-2">
            <span className='text-tertiary'>Progress: 65%</span>
            <span className='text-tertiary'>Hard Cap: 5,000 SOL</span>
          </div>
          <div className="w-full bg-tertiary/10 h-3 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/60 h-full w-[65%] rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-4 flex md:flex-row flex-col justify-center items-center gap-2">
          <div className="w-full bg-tertiary/5 border border-tertiary/10 rounded-2xl p-4 transition-all">
            <div className="flex justify-between text-xs mb-2">
              <span className='text-tertiary'>You Pay</span>
              <span className='text-tertiary'>Balance: 0.00 SOL</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="0.0"
                className="bg-transparent text-2xl font-semibold outline-none w-full"
                value={solAmount}
                onChange={(e) => setSolAmount(e.target.value)}
              />
              <div className="flex items-center justify-center gap-1 bg-tertiary/10 px-3 py-1.5 rounded-xl">
                {/* <div className="w-6 h-6 bg-gradient-to-br from-[#14F195] to-[#9945FF] rounded-full"></div> */}
                  <img className='w-8 h-6' src="/sol.png" alt="sol logo" />
                <span className="font-bold">SOL</span>
              </div>
            </div>
          </div>

          <div className="flex md:h-20 md:w-auto w-full items-center justify-center absolute top-[36%] left-0 md:relative">
            <div className="bg-primary h-10 border border-tertiary/10 p-2 rounded-full shadow-lg transform hover:scale-110 duration-300">
              <ArrowRight size={20} className="text-tertiary rotate-90 md:rotate-0 cursor-pointer" />
            </div>
          </div>

          <div className="w-full bg-tertiary/5 border border-tertiary/10 rounded-2xl p-4 transition-all">
            <div className="flex justify-between text-xs ">
              <span className='text-tertiary'>You Receive</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                readOnly
                className="bg-transparent text-2xl font-semibold outline-none w-full text-tertiary"
                value={lxAmount}
                placeholder="0"
              />
              <div className="flex items-center gap-2 bg-tertiary/10 px-3 py-1.5 rounded-xl">
                <Zap size={18} className="text-primary fill-primary" />
                <span className="font-bold text-tertiary">LX</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details List */}
        <div className="mt-8 space-y-3 bg-secondary/20 rounded-2xl p-4 text-sm border border-tertiary/5">
          <div className="flex justify-between text-tertiary">
            <span>Price</span>
            <span className="text-tertiary/80">1 LX = $0.015</span>
          </div>
          <div className="flex justify-between text-tertiary">
            <span>Exchange Rate</span>
            <span className="text-tertiary/80">1 SOL ≈ 2,900 LX</span>
          </div>
          <div className="flex justify-between text-tertiary">
            <span>Slippage</span>
            <span className="text-tertiary/80">0.5%</span>
          </div>
        </div>

        {/* Action Button */}
        <button 
            className="cursor-pointer w-full mt-8 bg-secondary/20 backdrop-blur-3xl hover:text-tertiary text-primary border border-primary py-4 rounded-2xl font-bold text-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
            onClick={()=>handleConnect()}
        >
          <Wallet size={20} />
          {isConnected ? `${address.slice(0,4)}...${address.slice(-4)}` : "Connect Wallet"}
        </button>

        {/* Footer Info */}
        <div className="mt-6 flex items-start gap-2 text-[13px] text-white leading-relaxed uppercase tracking-widest text-center justify-center">
          <Info size={14} className="mt-1" />
          <span>Listing price will be $0.02. Buy now for 2.4x gains.</span>
        </div>
      </div>
    </div>
  );
};

export default Presale;