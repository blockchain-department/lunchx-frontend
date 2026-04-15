import { useState, useEffect } from 'react';
import { Wallet, Info, Zap, ArrowRight, BanknoteArrowUp, BanknoteArrowDown, Loader2 } from 'lucide-react';
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { PRESALE_PROGRAM_ID, PRESALE_VAULT_PDA, network } from '../../utilities/config';
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
    claim:false
  });
  const { timeOver , vestingOver , presaleProgress , setPresaleProgress , setTimeOver , setVestingOver} = useTimeStore();
  const [totalClaimableLx, setTotalClaimableLx] = useState(0);
  const [solPrice, setSolPrice] = useState(0);
  const [activeTab,setActiveTab] = useState("Deposit");

  const inProgressGlobal = inProgress.deposit || inProgress.withdraw || inProgress.claim;

  const isConnected = connected;

  const EXCHANGE_RATE = solPrice/0.0042;

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
        new PublicKey(PRESALE_VAULT_PDA),  // vault/presale address
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
          skipPreflight: false,
          maxRetries: 0,
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

  const claimTokens = async () => {

    if(!isConnected){
      toast.error("Please connect your wallet");
      return;
    }

    if(solAmount <= 0 && activeTab == "Claim"){
      toast.error("Please enter a valid amount");
      return;
    }

    if(solAmount > solBalance && activeTab == "Claim"){
      toast.error("Insufficient balance");
      return;
    }

    if(solAmount > depositedSol && activeTab == "Claim"){
      toast.error("Amount more than deposited");
      return;
    }

    if(activeTab == "Claim"){
      setInProgress(prev => ({...prev,withdraw:true}));
    }else{
      setInProgress(prev => ({...prev,claim:true}));
    }

    try{

      const presaleInstance = await Presale.create(
        connection,
        new PublicKey(PRESALE_VAULT_PDA),  // vault/presale address
        new PublicKey(PRESALE_PROGRAM_ID)  // PRESALE_PROGRAM_ID
      );

      

      const escrows = await presaleInstance.getPresaleEscrowByOwner(new PublicKey(address));

      
      

      const claimTxs = await Promise.all(
        escrows.map((escrow) => {
          const escrowState = escrow.getEscrowAccount();

          if(activeTab == "Claim"){
            return presaleInstance.withdraw({
              amount: new BN(parseFloat(solAmount) * 1e9),
              owner: escrowState.owner,
              registryIndex: new BN(escrowState.registryIndex),
            });
          }else{
            return presaleInstance.claim({
              owner: escrowState.owner,
              registryIndex: new BN(escrowState.registryIndex),
            });
          }
        })
      );

      
      

      

      await Promise.all(
        claimTxs.map(async (claimTx) => {

          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
          claimTx.recentBlockhash = blockhash;
          claimTx.lastValidBlockHeight = lastValidBlockHeight;
          claimTx.feePayer = publicKey;

          const txSig = await sendTransaction(claimTx, connection, {
              skipPreflight: false,
              maxRetries: 0,
          });
          
          

          await connection.confirmTransaction(
            {
              signature: txSig,
              lastValidBlockHeight: claimTx.lastValidBlockHeight,
              blockhash: claimTx.recentBlockhash,
            },
            "finalized"
          );
        })
      );

      updateAllBalances();

      if(activeTab == "Claim"){
        setInProgress(prev => ({...prev,withdraw:false}));
      }else{
        setInProgress(prev => ({...prev,claim:false}));
      }

      toast.success("Transaction Confirmed");

    } catch (error) {
      console.log(error);
      
      // toast.error("Transaction Failed");
      if(activeTab == "Claim"){
        setInProgress(prev => ({...prev,withdraw:false}));
      }else{
        setInProgress(prev => ({...prev,claim:false}));
      }
    }
    
  };

  const fetchClaimableAmount = async () => {
    try {
      const presaleInstance = await Presale.create(
        connection,
        new PublicKey(PRESALE_VAULT_PDA),  // vault/presale address
        new PublicKey(PRESALE_PROGRAM_ID)  // PRESALE_PROGRAM_ID
      );
      const decimals = 9;

      const presaleData = await presaleInstance.getParsedPresale();
      console.log("Presale Data : ",presaleData);
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

      let presaleState = presaleData.getPresaleProgressState();

        if(presaleState == 3){
          setActiveTab("Claim")
        }

        setPresaleProgress(presaleState);

        const endTime = presaleData.presaleAccount.presaleEndTime.toString();
        const secondsLeft = Math.floor((endTime * 1000 - Date.now()) / 1000);

        console.log("Seconds Left : ",secondsLeft);
        console.log("Presale State : ",presaleState);

        if(secondsLeft <= 0 && presaleState == 0){
          updateAll();
        }
        if(presaleState == 2){
          setTimeOver(true);
        }
        if(presaleState == 3){
          setTimeOver(true);
          setVestingOver(true);
        }

      setDepositedSol(totalDepositedSol);
      setClaimableLx(totalClaimableLx);
      setClaimedLx(totalClaimedLx);
      setTotalClaimableLx(totalClaimableLxx);

      

      const hardcap = presaleRegisteries[0].presaleMaximumCap.toString() / Math.pow(10, decimals);
      setHardcap(hardcap);

      const totalSol = presaleRegisteries[0].presaleTotalDeposit.toString() / Math.pow(10, decimals);
      setTotalDepositedSol(totalSol);

      
    } catch (error) {
      console.log(error);
      
    }
  }

  async function getSolBalance() {
    const pubkey = new PublicKey(address);
    const lamports = await connection.getBalance(pubkey);
    return lamports / LAMPORTS_PER_SOL; // convert lamports → SOL
  }

  const updateAllBalances = () => {
    getSolBalance().then((balance) => {
      setSolBalance(balance);
    });
    fetchClaimableAmount();
  }

  useEffect(() => {
    if (isConnected && address) {
      updateAllBalances();
    }else{
      setSolBalance(0);
      setDepositedSol(0);
      setClaimableLx(0);
      setClaimedLx(0);
      setHardcap(0);
      setTotalDepositedSol(0);
    }
  }, [isConnected,address]);
  
  useEffect(() => {

    if(timeOver && vestingOver == false){
      updateAllBalances(); 
    }
    if(timeOver == true && vestingOver == true){
      updateAllBalances();
    }
  }, [timeOver,vestingOver]);

  

  useEffect(() => {
    if (solAmount > 0 && solAmount <= solBalance) {
      setLxAmount((solAmount * EXCHANGE_RATE).toLocaleString());
    } else {
      setLxAmount(0);
    }
  }, [solAmount]);
  
  console.log(
    "timeOver",timeOver,
    "vestingOver",vestingOver,
    "presaleProgress",presaleProgress,
  );
  

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

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          {(presaleProgress != 2 && presaleProgress != 3) && <button
            onClick={() => setActiveTab("Deposit")}
            className={`cursor-pointer px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === "Deposit" ? "bg-primary text-secondary" : "bg-tertiary/10 text-tertiary"}`}
          >
            Deposit
          </button>}
          {(presaleProgress != 2) && <button
            onClick={() => setActiveTab("Claim")}
            className={`cursor-pointer px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === "Claim" ? "bg-primary text-secondary" : "bg-tertiary/10 text-tertiary"}`}
          >
            Withdraw
          </button>}
        </div>

        {/* Input Section */}
        {( presaleProgress != 2) && <div className="relative space-y-4 flex md:flex-row flex-col justify-center items-center gap-2">
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
              <div className="flex items-center justify-center gap-1 bg-tertiary/10 px-3 py-1.5 rounded-xl">
                {/* <div className="w-6 h-6 bg-gradient-to-br from-[#14F195] to-[#9945FF] rounded-full"></div> */}
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
          {(isConnected == true && presaleProgress != 2 && presaleProgress != 3) && <button 
            className={`${inProgress.deposit || isConnected == false || inProgressGlobal  ? "cursor-not-allowed" : "cursor-pointer"} w-full mt-8 bg-secondary/20 backdrop-blur-3xl text-primary border border-primary py-4 rounded-full font-bold hover:scale-101 duration-300 text-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2`}
            onClick={()=>{
              depositTokens();
            }}
            disabled={inProgress.deposit || isConnected == false || presaleProgress == 2 || presaleProgress == 3 || inProgressGlobal}
          >
            {inProgress.deposit ? <Loader2 className="animate-spin" /> : <BanknoteArrowUp />}
            {`${inProgress.deposit ? "Depositing" : "Deposit"}`}
          </button>}

          {(isConnected == true && presaleProgress != 2) && <button 
            className={`${inProgress.withdraw || isConnected == false || presaleProgress == 2 || inProgressGlobal ? "cursor-not-allowed" : "cursor-pointer"} w-full mt-8 bg-secondary/20 backdrop-blur-3xl text-primary border border-primary py-4 rounded-full font-bold hover:scale-101 duration-300 text-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2`}
            onClick={()=>{
              if(presaleProgress == 3 && depositedSol == 0){
                toast.error("You have no deposited tokens to withdraw");
                return;
              }
              claimTokens();
            }}
            disabled={inProgress.withdraw || isConnected == false || presaleProgress == 2 || inProgressGlobal}
          >
            {inProgress.withdraw ? <Loader2 className="animate-spin" /> : <BanknoteArrowUp />}
            {`${inProgress.withdraw ? "Withdraw In Progress" : "Withdraw"}`}
          </button>}

          {(presaleProgress == 2 && isConnected == true) && <button 
            className={`${inProgress.claim || timeOver == false || claimableLx == 0 || isConnected == false || depositedSol == 0 || inProgressGlobal ? "cursor-not-allowed" : "cursor-pointer"} w-full mt-8 bg-secondary/20 backdrop-blur-3xl text-primary border border-primary py-4 rounded-full font-bold hover:scale-101 duration-300 text-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2`}
            onClick={()=>claimTokens()}
            disabled={inProgress.claim || timeOver == false || claimableLx == 0 || isConnected == false || depositedSol == 0 || inProgressGlobal}
          >
            {inProgress.claim ? <Loader2 className="animate-spin" /> : <BanknoteArrowDown />}
            {inProgress.claim ? "Claiming" : "Claim"}
          </button>}
        </div>

        {/* Details List */}
        <div className="mt-8 space-y-3 bg-secondary/20 rounded-2xl p-4 text-sm border border-tertiary/5">
          
          <div className="flex justify-between text-primary">
            <span className="text-tertiary">Network</span>
            <span className="text-primary text-[16px]">{network.toLocaleUpperCase()}</span>
          </div>
          <div className="flex justify-between text-primary">
            <span className="text-tertiary">Vault Address</span>
            <span className="text-primary text-[16px]">{PRESALE_VAULT_PDA}</span>
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