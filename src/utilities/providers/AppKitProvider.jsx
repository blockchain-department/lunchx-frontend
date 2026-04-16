import { useMemo } from "react";
import { clusterApiUrl } from "@solana/web3.js";
import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  CoinbaseWalletAdapter,
  PhantomWalletAdapter,
  TorusWalletAdapter
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import toast from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { network } from "../config";

const onError = (error) => {
  const msg = error?.message ?? "";
  if (msg.includes("User rejected")) {
    toast.error("You cancelled the connection.");
    return;
  }
  // Avoid treating send-tx / signing noise as a generic "connection failed"
  if (
    msg.includes("sendTransaction") ||
    msg.includes("Transaction") ||
    msg.includes("Unexpected error")
  ) {
    return;
  }

  toast.error("Wallet connection failed. Try again.");
};

export default function AppKitProvider({ children }) {

  const networkLocal = network == "devnet" ? WalletAdapterNetwork.Devnet : WalletAdapterNetwork.Mainnet;

  const endpoint = useMemo(() => clusterApiUrl(networkLocal), [networkLocal]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new TorusWalletAdapter()
    ],
    [network]
  );

  const queryClient = new QueryClient();

  return (
    <>
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect onError={onError}>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
    </>
  );
}