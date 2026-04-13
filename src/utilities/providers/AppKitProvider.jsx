import { useMemo } from "react";
import { clusterApiUrl } from "@solana/web3.js";
import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  CoinbaseWalletAdapter,
  TorusWalletAdapter
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import toast from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const onError = (error) => {
  if (error?.message?.includes("User rejected")) {
    toast.error("You cancelled the connection.");
    return;
  }

  toast.error("Wallet connection failed. Try again.");
};

export default function AppKitProvider({ children }) {
  const network = WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
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