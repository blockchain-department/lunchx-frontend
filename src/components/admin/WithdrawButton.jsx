import React, { useState } from "react";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { Presale, PRESALE_PROGRAM_ID } from "@meteora-ag/presale";

const PRESALE_ADDRESS = "8Ee8czFGwH7u3C7ooX2ucNCThkGQWErkyThNBJrK7ANL";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const WithdrawButton = () => {
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async (e) => {
    e.preventDefault();

    if (!publicKey) {
      alert("Connect your wallet first");
      return;
    }

    try {
      setLoading(true);

      // 1. Create presale instance
      const presale = await Presale.create(
        connection,
        PRESALE_ADDRESS,
        PRESALE_PROGRAM_ID
      );

      // 2. Build transaction
      const tx = await presale.creatorWithdraw({
        creator: publicKey,
      });

      // 3. Send transaction via wallet adapter
      const signature = await sendTransaction(tx, connection);

      // 4. Confirm transaction
      await connection.confirmTransaction(signature, "confirmed");

      alert("Withdraw successful ✅");
    } catch (err) {
      console.error(err);
      alert(err?.message || "Withdraw failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleWithdraw}
      disabled={loading}
      className="px-6 py-3 bg-primary text-black font-semibold rounded-xl cursor-pointer"
    >
      {loading ? "Withdrawing..." : "Execute"}
    </button>
  );
};

export default WithdrawButton;