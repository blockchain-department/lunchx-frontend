import React, { useState, useEffect } from 'react';
import { Wallet, Info, Zap, ArrowRight } from 'lucide-react';
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { PRESALE_PROGRAM_ID, PRESALE_VAULT_PDA, rpc_url } from '../../utilities/config';
import { Presale } from '@meteora-ag/presale';
import { BN } from 'bn.js';
import toast from 'react-hot-toast';

const PresaleComp = () => {
  const [solAmount, setSolAmount] = useState('');
  const [lxAmount, setLxAmount] = useState(0);
  const { address, isConnected } = useAppKitAccount();
  const { open, close } = useAppKit();
  const [solBalance,setSolBalance] = useState(0);
  const connection = new Connection(rpc_url, "confirmed");
  const { walletProvider : solWalletProvider } = useAppKitProvider("solana");

  const EXCHANGE_RATE = 20000; // 1 SOL = 2900 LX (Calculated: 145 / 0.05)

  const depositTokens = async () => {

    if(!isConnected){
      toast.error("Please connect your wallet");
      return;
    }

    if(solAmount <= 0){
      toast.error("Please enter a valid amount");
      return;
    }

    if(solAmount > solBalance){
      toast.error("Insufficient balance");
      return;
    }

    console.log("Withdraw Tokens Called!!!");

    try {
      const presaleInstance = await Presale.create(
        connection,
        new PublicKey(PRESALE_VAULT_PDA),  // vault/presale address
        new PublicKey(PRESALE_PROGRAM_ID)  // PRESALE_PROGRAM_ID
      );

      console.log("Presale Instance Created",presaleInstance);

      const depositTx = await presaleInstance.deposit({
        amount: new BN(parseFloat(solAmount) * 1e9),  // 0.1 SOL
        owner: new PublicKey(address),
        registryIndex: new BN(0)  // Default
      });

      console.log("Deposit Transaction Created",depositTx);

      const txSig = await solWalletProvider.sendTransaction(depositTx, connection);
      console.log("Withdraw transaction sent:", txSig);

      await connection.confirmTransaction(
        {
          signature: txSig,
          lastValidBlockHeight: depositTx.lastValidBlockHeight,
          blockhash: depositTx.recentBlockhash,
        },
        "finalized"
      );

      console.log("Transaction Confirmed");
      toast.success("Transaction Confirmed");
      
    } catch (error) {
      console.log("Error in withdrawTokens:", error);
      toast.error("Transaction Failed");
    }
    
  };

  const claimTokens = async () => {

    if(!isConnected){
      toast.error("Please connect your wallet");
      return;
    }

    if(solAmount <= 0){
      toast.error("Please enter a valid amount");
      return;
    }

    if(solAmount > solBalance){
      toast.error("Insufficient balance");
      return;
    }

    try{

      const presaleInstance = await Presale.create(
        connection,
        new PublicKey(PRESALE_VAULT_PDA),  // vault/presale address
        new PublicKey(PRESALE_PROGRAM_ID)  // PRESALE_PROGRAM_ID
      );

      console.log("Presale Instance Created",presaleInstance);

      const escrows = await presaleInstance.getPresaleEscrowByOwner(new PublicKey(address));

      console.log("Escrows Fetched",escrows);
      

      const withdrawTxs = await Promise.all(
        escrows.map(async (escrow) => {
          const escrowAccount = escrow.getEscrowAccount();
          return presaleInstance.withdraw({
            amount: new BN(parseFloat(solAmount) * 1e9),
            owner: escrowAccount.owner,
            registryIndex: new BN(escrowAccount.registryIndex),
          });
        })
      );

      console.log("Withdraw Transactions Created",withdrawTxs);

      await Promise.all(
        withdrawTxs.map(async (withdrawTx) => {

          const txSig = await solWalletProvider.sendTransaction(withdrawTx, connection);
          console.log("Withdraw transaction sent:", txSig);

          await connection.confirmTransaction(
            {
              signature: txSig,
              lastValidBlockHeight: withdrawTx.lastValidBlockHeight,
              blockhash: withdrawTx.recentBlockhash,
            },
            "finalized"
          );
        })
      ); 

      toast.success("Transaction Confirmed");

    } catch (error) {
      console.log("Error in withdrawTokens:", error);
      toast.error("Transaction Failed");
    }
    
  };

  const handleConnect = () => {
    if (isConnected) {
      open({ view: "Account" });
    } else {
      open({ view: "Connect", namespace: "solana" });
    }
  }

  async function getSolBalance() {
    const pubkey = new PublicKey(address);
    const lamports = await connection.getBalance(pubkey);
    return lamports / LAMPORTS_PER_SOL; // convert lamports → SOL
  }

  useEffect(() => {
    if (isConnected) {
      getSolBalance().then((balance) => {
        setSolBalance(balance);
      });
    }else{
      setSolBalance(0);
    }
  }, [isConnected]);

  useEffect(() => {
    if (solAmount > 0 && solAmount <= solBalance) {
      setLxAmount((solAmount * EXCHANGE_RATE).toLocaleString());
    } else {
      setLxAmount(0);
    }
  }, [solAmount]);

  return (
    <div id='presale' className="py-20 bg-secondary text-tertiary flex items-center justify-center p-6 font-sans">
      <div className="relative w-full max-w-5xl bg-tertiary/5 backdrop-blur-xl border border-tertiary/10 rounded-3xl px-8 py-12 shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-tertiary">
              LX Presale
            </h1>
          </div>
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
          <div className="w-full bg-tertiary/5 border border-tertiary/10 rounded-2xl mt-1 p-4 transition-all">
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
              <div className="flex items-center gap-2 bg-tertiary/10 px-3 py-2 rounded-xl">
                <Zap size={18} className="text-primary fill-primary" />
                <span className="font-bold text-tertiary">LX</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <button 
            className="cursor-pointer w-[50%] mt-8 bg-secondary/20 backdrop-blur-3xl text-primary border border-primary py-4 rounded-2xl font-bold hover:scale-101 duration-300 text-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
            onClick={()=>depositTokens()}
          >
            Deposit
          </button>
          <button 
              className="cursor-pointer w-[50%] mt-8 bg-secondary/20 backdrop-blur-3xl text-primary border border-primary py-4 rounded-2xl font-bold hover:scale-101 duration-300 text-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
              onClick={()=>claimTokens()}
          >
            Withdraw
          </button>
        </div>

        {/* Details List */}
        <div className="mt-8 space-y-3 bg-secondary/20 rounded-2xl p-4 text-sm border border-tertiary/5">
          <div className="flex justify-between text-tertiary">
            <span>Price</span>
            <span className="text-tertiary/80">1 LX = $0.00420</span>
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
            className="cursor-pointer w-full mt-8 bg-secondary/20 backdrop-blur-3xl text-primary border border-primary py-4 rounded-2xl font-bold hover:scale-103 duration-300 text-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
            onClick={()=>handleConnect()}
        >
          <Wallet size={20} />
          {isConnected ? `${solBalance.toFixed(2)} SOL` : "Connect Wallet"}
        </button>

        {/* Footer Info */}
        <div className="mt-6 flex items-start gap-2 text-[13px] text-white leading-relaxed uppercase tracking-widest text-center justify-center">
          <Info size={14} className="mt-1" />
          <span>Listing price: $0.01. Buy now for a potential 2.4× return. Hold for 30 days to receive a 15% bonus allocation.</span>
        </div>
      </div>
    </div>
  );
};

export default PresaleComp;