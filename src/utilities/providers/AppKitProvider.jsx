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
import { network, rpcUrl } from "../config";
import formatSolanaError from "../formatSolanaError";

const queryClient = new QueryClient();

const onError = (error) => {
  console.error(error);
  toast.error(formatSolanaError(error));
};

export default function AppKitProvider({ children }) {
  const networkLocal = network === "devnet" ? WalletAdapterNetwork.Devnet : WalletAdapterNetwork.Mainnet;

  const endpoint = useMemo(
    () => rpcUrl || clusterApiUrl(networkLocal),
    [networkLocal]
  );

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new TorusWalletAdapter()
    ],
    []
  );

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