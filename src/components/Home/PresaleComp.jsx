import { useState, useEffect, useRef } from 'react';
import { Wallet, Info, Zap, ArrowRight, BanknoteArrowUp, BanknoteArrowDown, Loader2 } from 'lucide-react';
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { PRESALE_PROGRAM_ID, network } from '../../utilities/config';
import { Presale, getOnChainTimestamp } from '@meteora-ag/presale';
import { BN } from 'bn.js';
import toast from 'react-hot-toast';
import useTimeStore from '../../utilities/store/TimeStore';
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const PresaleComp = () => {
  const [solAmount, setSolAmount] = useState('');
  const [lxAmount, setLxAmount] = useState(0);
  const { publicKey , sendTransaction , connected } = useWallet();
  const address = publicKey?.toBase58();
  const [solBalance,setSolBalance] = useState(0);
  const { connection } = useConnection();
  const [depositedSol, setDepositedSol] = useState(0);
  const [claimableLx, setClaimableLx] = useState(0);
  const [claimedLx, setClaimedLx] = useState(0);
  const [hardcap, setHardcap] = useState(0);
  const [totalDepositedSol, setTotalDepositedSol] = useState(0);
  const [inProgress,setInProgress] = useState({
    deposit:false,
    withdraw:false,
    claim:false,
    refund:false,
  });
  // SDK-driven permission flags — set from parsedPresale.canClaim() and per-escrow
  // canWithdrawRemainingQuoteAmount() on every fetchClaimableAmount call.
  const [canClaim, setCanClaim] = useState(false);
  const [canRefund, setCanRefund] = useState(false);
  const { timeOver , vestingOver , presaleProgress , setPresaleProgress , setTimeOver , setVestingOver , updateAll, started, prealeVaultPda, setPrealeVaultPda} = useTimeStore();
  const [totalClaimableLx, setTotalClaimableLx] = useState(0);
  const [solPrice, setSolPrice] = useState(0);
  const [activeTab,setActiveTab] = useState("Deposit");
  const fetchingPrsaleData = useRef(false);

  const inProgressGlobal = inProgress.deposit || inProgress.withdraw || inProgress.claim || inProgress.refund;

  const isConnected = connected;

  const EXCHANGE_RATE = solPrice/0.0042;

  useEffect(() => {
    async function getUserVaultsEfficiently() {
      const publicKeyEnv = new PublicKey(import.meta.env.VITE_PUBKEY);
      const creatorBytes = publicKeyEnv.toBase58(); // For memcmp
      const programID = new PublicKey(PRESALE_PROGRAM_ID);
      const accounts = await connection.getProgramAccounts(programID, {
        encoding: 'base64', // Or 'jsonParsed' if supported
        filters: [
          // { dataSize: 1234 }, // Get from Solscan/raw data
          {
            memcmp: {
              offset: 8, // Adjust: 0=discriminator (8 bytes), 8=creator (32 bytes)
              bytes: creatorBytes,
            },
          },
        ],
      });
      // Deserialize/parse accounts as needed
      console.log(accounts);
      if(accounts.length > 0){
        console.log(accounts[accounts.length - 1].pubkey.toBase58());
        setPrealeVaultPda(accounts[accounts.length - 1].pubkey.toBase58());
      }
    }
    getUserVaultsEfficiently();
  }, [publicKey,connection,PRESALE_PROGRAM_ID]);

  useEffect(() => {
      const fetchCryptoPrices = async () => {
      try {
          const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
          );
          const data = await response.json();
          setSolPrice(data.solana.usd);
      } catch (error) {
          setSolPrice(84);
      }
      };
      fetchCryptoPrices();
  }, []);

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

    setInProgress(prev => ({...prev,deposit:true}));

    

    try {
      const presaleInstance = await Presale.create(
        connection,
        new PublicKey(prealeVaultPda),  // vault/presale address
        new PublicKey(PRESALE_PROGRAM_ID)  // PRESALE_PROGRAM_ID
      );

      

      const depositTx = await presaleInstance.deposit({
        amount: new BN(parseFloat(solAmount) * 1e9),  // 0.1 SOL
        owner: new PublicKey(address),
        registryIndex: new BN(0)  // Default
      });

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
      depositTx.recentBlockhash = blockhash;
      depositTx.lastValidBlockHeight = lastValidBlockHeight;
      depositTx.feePayer = publicKey;

      const txSig = await sendTransaction(depositTx, connection, {
          skipPreflight: true,
          maxRetries: 0,
          preflightCommitment: "confirmed",
      });
      

      await connection.confirmTransaction(
        {
          signature: txSig,
          lastValidBlockHeight: depositTx.lastValidBlockHeight,
          blockhash: depositTx.recentBlockhash,
        },
        "finalized"
      );

      updateAllBalances();

      setInProgress(prev => ({...prev,deposit:false}));

      setSolAmount(0);

      
      toast.success("Transaction Confirmed");
      
    } catch (error) {
      
      // toast.error("Transaction Failed");
      setInProgress(prev => ({...prev,deposit:false}));
    }
    
  };

  // Partial withdrawal during Ongoing (state 1). Requires a SOL amount input.
  // Must NOT be called after completion — use claimTokens() for state 2.
  const withdrawPartial = async () => {
    if (!isConnected) { toast.error("Please connect your wallet"); return; }
    if (solAmount <= 0) { toast.error("Please enter a valid amount"); return; }
    if (solAmount > solBalance) { toast.error("Insufficient balance"); return; }
    if (solAmount > depositedSol) { toast.error("Amount more than deposited"); return; }

    setInProgress(prev => ({...prev, withdraw: true}));
    try {
      const presaleInstance = await Presale.create(
        connection, new PublicKey(prealeVaultPda), new PublicKey(PRESALE_PROGRAM_ID)
      );
      const escrows = await presaleInstance.getPresaleEscrowByOwner(new PublicKey(address));
      const txs = await Promise.all(
        escrows.map(escrow => {
          const s = escrow.getEscrowAccount();
          return presaleInstance.withdraw({
            amount: new BN(parseFloat(solAmount) * 1e9),
            owner: s.owner,
            registryIndex: new BN(s.registryIndex),
          });
        })
      );
      await Promise.all(txs.map(async tx => {
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
        tx.recentBlockhash = blockhash; tx.lastValidBlockHeight = lastValidBlockHeight; tx.feePayer = publicKey;
        const sig = await sendTransaction(tx, connection, { skipPreflight: false, maxRetries: 0 });
        await connection.confirmTransaction({ signature: sig, lastValidBlockHeight: tx.lastValidBlockHeight, blockhash: tx.recentBlockhash }, "finalized");
      }));
      updateAllBalances();
      setInProgress(prev => ({...prev, withdraw: false}));
      toast.success("Transaction Confirmed");
    } catch (error) {
      setInProgress(prev => ({...prev, withdraw: false}));
    }
  };

  // Claim purchased tokens after Completed (state 2) + vestingStartTime passed (canClaim true).
  // No amount input — claims all pending tokens across all escrows.
  // activeTab is intentionally NOT read here; call site (Claim button) already gates on canClaim.
  const claimTokens = async () => {
    if (!isConnected) { toast.error("Please connect your wallet"); return; }

    setInProgress(prev => ({...prev, claim: true}));
    try {
      const presaleInstance = await Presale.create(
        connection, new PublicKey(prealeVaultPda), new PublicKey(PRESALE_PROGRAM_ID)
      );
      const escrows = await presaleInstance.getPresaleEscrowByOwner(new PublicKey(address));
      const txs = await Promise.all(
        escrows.map(escrow => {
          const s = escrow.getEscrowAccount();
          return presaleInstance.claim({ owner: s.owner, registryIndex: new BN(s.registryIndex) });
        })
      );
      await Promise.all(txs.map(async tx => {
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
        tx.recentBlockhash = blockhash; tx.lastValidBlockHeight = lastValidBlockHeight; tx.feePayer = publicKey;
        const sig = await sendTransaction(tx, connection, { skipPreflight: false, maxRetries: 0 });
        await connection.confirmTransaction({ signature: sig, lastValidBlockHeight: tx.lastValidBlockHeight, blockhash: tx.recentBlockhash }, "finalized");
      }));
      updateAllBalances();
      setInProgress(prev => ({...prev, claim: false}));
      toast.success("Transaction Confirmed");
    } catch (error) {
      setInProgress(prev => ({...prev, claim: false}));
    }
  };

  // Refund remaining quote tokens.
  // Called when presale Failed (state 3) OR Completed + Prorata (canWithdrawRemainingQuote).
  // Uses withdrawRemainingQuote(), NOT withdraw() — the latter is for partial mid-presale exits.
  const refundTokens = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    setInProgress(prev => ({...prev, refund: true}));

    try {
      const presaleInstance = await Presale.create(
        connection,
        new PublicKey(prealeVaultPda),
        new PublicKey(PRESALE_PROGRAM_ID)
      );

      const parsedPresale = presaleInstance.getParsedPresale();
      const escrows = await presaleInstance.getPresaleEscrowByOwner(new PublicKey(address));

      const refundableTxs = await Promise.all(
        escrows
          .filter(escrow => escrow.canWithdrawRemainingQuoteAmount(parsedPresale))
          .map(escrow => {
            const escrowState = escrow.getEscrowAccount();
            return presaleInstance.withdrawRemainingQuote({
              owner: escrowState.owner,
              registryIndex: new BN(escrowState.registryIndex),
            });
          })
      );

      if (refundableTxs.length === 0) {
        toast.error("No refundable amount available");
        setInProgress(prev => ({...prev, refund: false}));
        return;
      }

      await Promise.all(
        refundableTxs.map(async (refundTx) => {
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
          refundTx.recentBlockhash = blockhash;
          refundTx.lastValidBlockHeight = lastValidBlockHeight;
          refundTx.feePayer = publicKey;

          const txSig = await sendTransaction(refundTx, connection, {
            skipPreflight: false,
            maxRetries: 0,
          });

          await connection.confirmTransaction(
            { signature: txSig, lastValidBlockHeight: refundTx.lastValidBlockHeight, blockhash: refundTx.recentBlockhash },
            "finalized"
          );
        })
      );

      updateAllBalances();
      setInProgress(prev => ({...prev, refund: false}));
      toast.success("Refund successful");
    } catch (error) {
      setInProgress(prev => ({...prev, refund: false}));
    }
  };

  const fetchClaimableAmount = async () => {
    try {

      if(fetchingPrsaleData.current) return;
      fetchingPrsaleData.current = true;

      const presaleInstance = await Presale.create(
        connection,
        new PublicKey(prealeVaultPda),  // vault/presale address
        new PublicKey(PRESALE_PROGRAM_ID)  // PRESALE_PROGRAM_ID
      );
      const decimals = 9;

      const presaleData = await presaleInstance.getParsedPresale();
      const presaleRegisteries = await presaleData.getAllPresaleRegistries()

      

      const escrows = await presaleInstance.getPresaleEscrowByOwner(new PublicKey(address));

      

      const onChainTimestamp = await getOnChainTimestamp(connection).then((ts) =>
        Number(ts)
      );

      let totalDepositedSol = 0;
      let totalClaimableLx = 0;
      let totalClaimedLx = 0;
      let totalClaimableLxx = 0;

      for (const escrow of escrows) {
        

        // const floatValue = escrow.escrowAccount.totalDeposit.toString() / Math.pow(10, decimals);
        const floatValue = escrow.getDepositUiAmount();
        totalDepositedSol += floatValue;

        // totalClaimableLx = escrow.escrowAccount.pendingClaimToken.toString() / Math.pow(10, decimals);
        totalClaimableLx += escrow.getPendingClaimableUiAmount(presaleData, onChainTimestamp);
        
        // totalClaimedLx = escrow.escrowAccount.totalClaimedToken.toString() / Math.pow(10, decimals);
        totalClaimedLx += escrow.getClaimedUiAmount();

        totalClaimableLxx += escrow.getTotalClaimableUiAmount(presaleData);

      }

      const presaleState = presaleData.getPresaleProgressState();
      setPresaleProgress(presaleState);

      // Derive claim/refund eligibility directly from SDK helpers rather than
      // guessing from raw state numbers.
      // canClaim(): state === Completed (2) AND currentTime >= vestingStartTime
      setCanClaim(presaleData.canClaim());
      // canWithdrawRemainingQuote(): Failed (3) OR (Completed (2) AND Prorata mode)
      // Per-escrow guard: isRemainingQuoteWithdrawn must be 0
      const presaleAllowsRefund = presaleData.canWithdrawRemainingQuote();
      const userHasRefundableEscrow = escrows.some(
        escrow => escrow.canWithdrawRemainingQuoteAmount(presaleData)
      );
      setCanRefund(presaleAllowsRefund && userHasRefundableEscrow);

      // Presale has ended when Completed (2) or Failed (3)
      const endTime = presaleData.presaleAccount.vestingEndTime.toString();
      const secondsLeft = Math.floor((endTime * 1000 - Date.now()) / 1000);

      if(presaleState == 3){
        setActiveTab("Claim");
        setTimeOver(true);
        setVestingOver(true);
      }else if(secondsLeft > 0 && presaleState == 2){
        setTimeOver(true);
      }else if(secondsLeft <= 0 && presaleState == 2){
        updateAll();
      }
      // Note: state 3 is Failed (minimum cap not reached), not "vesting over".
      // Do not call setVestingOver here — vesting only applies to Completed presales.

      setDepositedSol(totalDepositedSol);
      setClaimableLx(totalClaimableLx);
      setClaimedLx(totalClaimedLx);
      setTotalClaimableLx(totalClaimableLxx);

      

      const hardcap = presaleRegisteries[0].presaleMaximumCap.toString() / Math.pow(10, decimals);
      setHardcap(hardcap);

      const totalSol = presaleRegisteries[0].presaleTotalDeposit.toString() / Math.pow(10, decimals);
      setTotalDepositedSol(totalSol);

      fetchingPrsaleData.current = false;

      
    } catch (error) {
      fetchingPrsaleData.current = false;
    }
  }

  async function getSolBalance() {
    try{
    const pubkey = new PublicKey(address);
    const lamports = await connection.getBalance(pubkey);
    return lamports / LAMPORTS_PER_SOL; // convert lamports → SOL
    }catch(error){
      return 0;
    }
  }

  const updateAllBalances = () => {
    getSolBalance().then((balance) => {
      setSolBalance(balance);
    });
    fetchClaimableAmount();
  }

  useEffect(() => {
    if (isConnected && address && prealeVaultPda) {
      updateAllBalances();
    }else{
      setSolBalance(0);
      setDepositedSol(0);
      setClaimableLx(0);
      setClaimedLx(0);
      setHardcap(0);
      setTotalDepositedSol(0);
    }
  }, [isConnected,address,prealeVaultPda]);
  
  useEffect(() => {

    if(timeOver && vestingOver == false){
      if(fetchingPrsaleData.current) return;
      setTimeout(() => {
        updateAllBalances();
      }, 3000); 
    }
    if(timeOver == true && vestingOver == true){
      if(fetchingPrsaleData.current) return;
      setTimeout(() => {
        updateAllBalances();
      }, 3000);
    }
  }, [timeOver,vestingOver]);

  useEffect(() => {
    if(started){
      setTimeout(() => {
        updateAllBalances();
      }, 3000);
    }
  }, [started]);

  

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
            <span className='text-tertiary'>Progress: {((totalDepositedSol / hardcap) * 100) || 0}%</span>
            <span className='text-tertiary'>Hard Cap: {hardcap} SOL</span>
          </div>
          <div className="w-full bg-tertiary/10 h-3 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/60 h-full rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]" style={{width: `${((totalDepositedSol / hardcap) * 100) || 0}%`}}></div>
          </div>
        </div>

        {/* State banners */}
        {presaleProgress === 0 && (
          <div className="mb-6 bg-tertiary/10 border border-tertiary/20 rounded-xl p-4 text-center text-tertiary/60 text-sm">
            Presale has not started yet.
          </div>
        )}
        {presaleProgress === 3 && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center text-sm">
            <span className="text-red-400 font-semibold">Presale Failed</span>
            <span className="text-tertiary/60"> — minimum cap was not reached. Your full deposit is available for refund.</span>
          </div>
        )}
        {presaleProgress === 2 && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center text-sm">
            <span className="text-green-400 font-semibold">Presale Sucessfull</span>
            <span className="text-tertiary/60"> — {claimedLx == totalClaimableLx ? 'You have claimed all your LX tokens.' : 'You can now claim your LX tokens.'}</span>
          </div>
        )}

        {/* Tabs — only visible during Ongoing (state 1) */}
        <div className="flex justify-center gap-4 mb-8">
          {presaleProgress === 1 && <button
            onClick={() => setActiveTab("Deposit")}
            className={`cursor-pointer px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === "Deposit" ? "bg-primary text-secondary" : "bg-tertiary/10 text-tertiary"}`}
          >
            Deposit
          </button>}
          {presaleProgress === 1 && <button
            onClick={() => setActiveTab("Claim")}
            className={`cursor-pointer px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === "Claim" ? "bg-primary text-secondary" : "bg-tertiary/10 text-tertiary"}`}
          >
            Withdraw
          </button>}
        </div>

        {/* Input Section — only during Ongoing (state 1); refund/claim need no amount input */}
        {presaleProgress === 1 && <div className="relative space-y-4 flex md:flex-row flex-col justify-center items-center gap-2">
           <div className="w-full bg-tertiary/5 border border-tertiary/10 rounded-2xl mt-1 p-4 transition-all">
            <div className="flex justify-between text-xs mb-2">
              <span className='text-tertiary'>You {activeTab === "Deposit" ? "Pay" : "Receive"}</span>
              <span className='text-tertiary'>Balance: ~{solBalance.toFixed(2)} SOL</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="0.0"
                className="bg-transparent text-2xl font-semibold outline-none w-full"
                value={solAmount}
                onChange={(e) => setSolAmount(e.target.value)}
              />
              <div className="flex items-center justify-center gap-1 bg-tertiary/10 px-3 py-1.5 rounded-xl cursor-pointer" onClick={() => {
                if(activeTab == "Deposit"){
                  setSolAmount(solBalance);
                }else{
                  setSolAmount(depositedSol);
                }
              }}>
                <span className="font-bold">MAX</span>
              </div>
              <div className="flex items-center justify-center gap-1 bg-tertiary/10 px-3 py-1.5 rounded-xl">
                <img className='w-8 h-6' src="/sol.png" alt="sol logo" />
                <span className="font-bold">SOL</span>
              </div>
            </div>
          </div>

          <div className={`${activeTab === "Deposit" ? "flex" : "hidden"} md:h-20 md:w-auto w-full items-center justify-center absolute top-[42%] left-0 md:relative`}>
            <div className="bg-primary h-10 border border-tertiary/10 p-2 rounded-full shadow-lg transform hover:scale-110 duration-300">
              <ArrowRight size={20} className="text-tertiary rotate-90 md:rotate-0 cursor-pointer" />
            </div>
          </div>

          <div className={`${activeTab === "Deposit" ? "block" : "hidden"} w-full bg-tertiary/5 border border-tertiary/10 rounded-2xl p-4 transition-all`}>
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
        </div>}

        <div className="flex items-center justify-center gap-2">
          {/* Deposit — Ongoing (state 1) only */}
          {(isConnected && presaleProgress === 1) && <button
            className={`${inProgress.deposit || inProgressGlobal ? "cursor-not-allowed" : "cursor-pointer"} w-full mt-8 bg-secondary/20 backdrop-blur-3xl text-primary border border-primary py-4 rounded-full font-bold hover:scale-101 duration-300 text-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2`}
            onClick={() => depositTokens()}
            disabled={inProgress.deposit || inProgressGlobal}
          >
            {inProgress.deposit ? <Loader2 className="animate-spin" /> : <BanknoteArrowUp />}
            {inProgress.deposit ? "Depositing" : "Deposit"}
          </button>}

          {/* Partial withdraw — Ongoing (state 1) only */}
          {(isConnected && presaleProgress === 1) && <button
            className={`${inProgress.withdraw || inProgressGlobal ? "cursor-not-allowed" : "cursor-pointer"} w-full mt-8 bg-secondary/20 backdrop-blur-3xl text-primary border border-primary py-4 rounded-full font-bold hover:scale-101 duration-300 text-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2`}
            onClick={() => withdrawPartial()}
            disabled={inProgress.withdraw || inProgressGlobal}
          >
            {inProgress.withdraw ? <Loader2 className="animate-spin" /> : <BanknoteArrowUp />}
            {inProgress.withdraw ? "Withdrawing..." : "Withdraw"}
          </button>}

          {/* Claim tokens — Completed (state 2), gated by canClaim() which checks vestingStartTime */}
          {(isConnected && presaleProgress === 2 && claimableLx > 0) && <button
            className={`${inProgress.claim || claimableLx === 0 || depositedSol === 0 || inProgressGlobal ? "cursor-not-allowed" : "cursor-pointer"} w-full mt-8 bg-secondary/20 backdrop-blur-3xl text-primary border border-primary py-4 rounded-full font-bold hover:scale-101 duration-300 text-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2`}
            onClick={() => claimTokens()}
            disabled={inProgress.claim || claimableLx === 0 || depositedSol === 0 || inProgressGlobal}
          >
            {inProgress.claim ? <Loader2 className="animate-spin" /> : <BanknoteArrowDown />}
            {inProgress.claim ? "Claiming..." : "Claim"}
          </button>}

          {/* Refund — Failed (state 3) OR Completed + Prorata (canWithdrawRemainingQuote).
              Uses withdrawRemainingQuote(), returns full deposit + fees. No amount input needed. */}
          {(isConnected && canRefund) && <button
            className={`${inProgress.refund || inProgressGlobal ? "cursor-not-allowed" : "cursor-pointer"} w-full mt-8 bg-secondary/20 backdrop-blur-3xl text-primary border border-primary py-4 rounded-full font-bold hover:scale-101 duration-300 text-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2`}
            onClick={() => refundTokens()}
            disabled={inProgress.refund || inProgressGlobal}
          >
            {inProgress.refund ? <Loader2 className="animate-spin" /> : <BanknoteArrowDown />}
            {inProgress.refund ? "Refunding..." : "Refund"}
          </button>}
        </div>

        {/* Details List */}
        <div className="space-y-3 bg-secondary/20 rounded-2xl p-4 text-sm border border-tertiary/5">
          
          <div className="flex justify-between text-primary">
            <span className="text-tertiary">Network</span>
            <span className="text-primary text-[16px]">{network.toLocaleUpperCase()}</span>
          </div>
          <div className="flex justify-between text-primary">
            <span className="text-tertiary">Vault Address</span>
            <span className="text-primary text-[16px]">{prealeVaultPda ? prealeVaultPda : "PRESALE HAS NOT STARTED YET!"}</span>
          </div>
          <div className="flex justify-between text-primary">
            <span className="text-tertiary">Deposited SOL</span>
            <span className="text-primary text-[16px]">{depositedSol}</span>
          </div>
          <div className="flex justify-between text-primary">
            <span className="text-tertiary">Claimable LX (Now)</span>
            <span className="text-primary text-[16px]">{claimableLx}</span>
          </div>
          {/* <div className="flex justify-between text-primary">
            <span className="text-tertiary">Claimable LX (After 15 Days)</span>
            <span className="text-primary text-[16px]">{totalClaimableLx == ? totalClaimableLx - claimableLx : totalClaimableLx - claimedLx}</span>
          </div> */}
          <div className="flex justify-between text-primary">
            <span className="text-tertiary">Claimable LX (Total)</span>
            <span className="text-primary text-[16px]">{totalClaimableLx}</span>
          </div>
          <div className="flex justify-between text-primary">
            <span className="text-tertiary">Claimed LX</span>
            <span className="text-primary text-[16px]">{claimedLx}</span>
          </div>
        </div>

        <div className="mt-8 space-y-3 bg-secondary/20 rounded-2xl p-4 text-sm border border-tertiary/5">
          <div className="flex justify-between text-tertiary">
            <span>Total Deposited</span>
            <span className="text-tertiary/80">{totalDepositedSol}</span>
          </div>
          <div className="flex justify-between text-tertiary">
            <span>Price</span>
            <span className="text-tertiary/80">1 LX = $0.00420</span>
          </div>
          <div className="flex justify-between text-tertiary">
            <span>Exchange Rate</span>
            <span className="text-tertiary/80">1 SOL ≈ {EXCHANGE_RATE.toFixed(2)} LX</span>
          </div>
          <div className="flex justify-between text-tertiary">
            <span>Slippage</span>
            <span className="text-tertiary/80">0.5%</span>
          </div>
        </div>

        {/* Action Button */}
        {/* <button 
            className="cursor-pointer w-full mt-8 bg-secondary/20 backdrop-blur-3xl text-primary border border-primary py-4 rounded-2xl font-bold hover:scale-103 duration-300 text-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
            onClick={()=>handleConnect()}
        >
          <Wallet size={20} />
          {isConnected ? `${solBalance.toFixed(2)} SOL` : "Connect Wallet"}
        </button> */}
        <div className='w-full flex items-center justify-center mt-5'>
          <WalletMultiButton />
        </div>

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