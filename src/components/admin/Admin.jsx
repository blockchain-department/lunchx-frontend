import { Banknote, Plus } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { main } from "../scripts/createPresale";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { creatorWithdraw } from "../scripts/createrWithdraw";
import WithdrawButton from "./WithdrawButton";
import useCreateToken from "../../utilities/helpers/CreateToken";
const Admin = () => {
  const videoRef = useRef(null);
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const address = publicKey?.toBase58();
  const { createToken, tokenInfo, isCreating, progress, error } =
    useCreateToken();

  const handleLaunch = async (e) => {
    // e.preventDefault();
    // const tx = await main(publicKey);
    // const { blockhash, lastValidBlockHeight } =
    //   await connection.getLatestBlockhash("confirmed");
    // tx.recentBlockhash = blockhash;
    // tx.lastValidBlockHeight = lastValidBlockHeight;
    // tx.feePayer = publicKey;

    // const txSig = await sendTransaction(tx, connection, {
    //   skipPreflight: false,
    //   maxRetries: 0,
    // });

    // try {
    //   await connection.confirmTransaction({
    //     signature: txSig,
    //     lastValidBlockHeight: depositTx.lastValidBlockHeight,
    //     blockhash: depositTx.recentBlockhash,
    //   });
    // } catch (error) {
    //   alert("presale not created", error);
    // }

    try {
      const info = await createToken({
        name: "Presale Token",
        symbol: "PSALE",
        decimals: 6,
        totalSupply: 1_000_000,
      });
      console.log("Mint:", info.mintAddress);
      // Next → pass info.meteora.tokenMint to vault creation
    } catch (e) {
      // error already set in hook state
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();

    if (!publicKey) {
      alert("Connect wallet first");
      return;
    }

    try {
      const tx = await creatorWithdraw({ publicKey });

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");

      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      const sig = await sendTransaction(tx, connection);

      await connection.confirmTransaction({
        signature: sig,
        blockhash,
        lastValidBlockHeight,
      });

      alert("Withdraw successful ✅");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7;
    }
  }, []);

  return (
    <div className="relative w-full min-h-screen flex justify-center items-center overflow-hidden">
      {/* Overlay */}
      <div className="absolute w-full h-full bg-secondary/50 z-0"></div>

      {/* Main Background Video */}
      <video
        ref={videoRef}
        className="absolute w-full h-full top-0 left-0 object-cover z-0 opacity-50"
        autoPlay
        loop
        muted
      >
        <source src="/LAUNCHX-VIDEO.mp4" type="video/mp4" />
      </video>

      {/* Secondary Background Video */}
      <video
        className="absolute w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
      >
        <source
          src="https://websites.godaddy.com/categories/v4/videos/raw/video/uA41GmyyG8IMaxXdb"
          type="video/mp4"
        />
      </video>

      {/* CONTENT */}
      <div className="relative container mx-auto flex justify-center items-center px-4 z-10">
        <div className="w-full max-w-2xl bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-4 items-center">
              <div className="flex justify-center items-center bg-primary rounded-md p-2">
                <Plus className="size-6 sm:size-7" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base sm:text-lg font-semibold text-white">
                  Create Presale
                </h1>
                <h1 className="text-sm sm:text-base text-white/70">
                  Initialize new liquidity vault
                </h1>
              </div>
            </div>

            <div
              onClick={handleLaunch}
              className="flex justify-center items-center px-5 py-2 bg-primary rounded-xl w-full sm:w-auto cursor-pointer"
            >
              <button className="text-black  font-semibold text-base sm:text-lg w-full cursor-pointer">
                Launch
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-4 items-center">
              <div className="flex justify-center items-center bg-primary rounded-md p-2">
                <Banknote className="size-6 sm:size-7" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base sm:text-lg font-semibold text-white">
                  Withdraw
                </h1>
                <h1 className="text-sm sm:text-base text-white/70">
                  Transfer funds to creater wallet
                </h1>
              </div>
            </div>

            <div className="flex justify-center items-center  bg-primary rounded-xl w-full sm:w-auto cursor-pointer">
              <WithdrawButton />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-4 items-center">
              <div className="flex justify-center items-center bg-primary rounded-md p-2">
                <Banknote className="size-6 sm:size-7" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base sm:text-lg font-semibold text-white">
                  Unsold Tokens
                </h1>
                <h1 className="text-sm sm:text-base text-white/70">
                  Trigger burn or refund action
                </h1>
              </div>
            </div>

            <div className="flex justify-center items-center px-4 py-2 bg-primary rounded-xl w-full sm:w-auto  cursor-pointer">
              <button className="text-black font-semibold text-base sm:text-lg w-full cursor-pointer">
                Perform
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
