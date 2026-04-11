// AppKitProvider.jsx
import { createAppKit, useAppKitAccount } from "@reown/appkit/react";
import { SolanaAdapter, useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import { solana, solanaTestnet, solanaDevnet } from "@reown/appkit/networks";
import { PublicKey } from "@solana/web3.js";
import { useState, useEffect } from "react";
import { network } from "../config";

const solanaWeb3JsAdapter = new SolanaAdapter();

const projectId = import.meta.env.VITE_PROJECT_ID;

const metadata = {
  name: "AppKit",
  description: "AppKit Solana Example",
  url: "https://example.com",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

const networks = network === "mainnet" ? [solana] : network === "testnet" ? [solanaTestnet] : [solanaDevnet];


createAppKit({
  adapters: [solanaWeb3JsAdapter],
  networks: networks,
  metadata,
  projectId,
  features: {
    analytics: true,
    connectMethodsOrder: ["wallet"],
  },
  enableReconnect: false,
  // ✅ Hide the "All Wallets" browser completely
  // allWallets: "ONLY_MOBILE",

  // ✅ Use the real WalletConnect explorer IDs
  featuredWalletIds: [
    "a797aa35c0fadbfc1a53e7f675aa9a54f8ea3f71e5a2e1a70a1c87ad69b2c93", // Phantom
    "fd4a2d4e4328f05e93ab2c66f3b7b695f68c3547cb5bc3a5a53e9f1b3e5ddb1a", // Solflare
  ],
});

export function AppKitProvider({ children }) {
  return <>{children}</>;
}

// Hook to use anywhere in your app
export function useSolanaBalance() {
  const { connection } = useAppKitConnection();
  const { address, isConnected } = useAppKitAccount();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!connection || !address || !isConnected) return;

    const fetchBalance = async () => {
      try {
        setLoading(true);
        setError(null);
        const pubKey = new PublicKey(address);
        const lamports = await connection.getBalance(pubKey);
        setBalance(lamports / 1e9); // convert to SOL
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [connection, address, isConnected]);

  return { balance, loading, error };
}