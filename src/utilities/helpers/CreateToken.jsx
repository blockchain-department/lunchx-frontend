import { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  getMint,
} from "@solana/spl-token";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const LOCAL_STORAGE_KEY = "presale_token_info";

// ─── localStorage HELPERS ────────────────────────────────────────────────────

const saveTokenInfo = (info) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(info));
  } catch (e) {
    console.error("[saveTokenInfo] Failed:", e);
  }
};

const loadTokenInfo = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("[loadTokenInfo] Failed:", e);
    return null;
  }
};

const clearTokenInfo = () => localStorage.removeItem(LOCAL_STORAGE_KEY);

// ─── UTILITY ─────────────────────────────────────────────────────────────────

const toRawAmount = (amount, decimals) =>
  BigInt(Math.round(amount * Math.pow(10, decimals)));

// ─── HOOK ────────────────────────────────────────────────────────────────────

/**
 * useCreateToken
 *
 * Internally uses useWallet() and useConnection() from wallet-adapter-react.
 * Your component tree must be wrapped in:
 *   <ConnectionProvider> → <WalletProvider> → <WalletModalProvider>
 *
 * @returns {{
 *   createToken : (params: TokenParams) => Promise<TokenInfo>,
 *   tokenInfo   : TokenInfo | null,
 *   isCreating  : boolean,
 *   progress    : string,
 *   error       : string | null,
 *   clearToken  : () => void,
 *   connected   : boolean,
 *   publicKey   : PublicKey | null,
 * }}
 */
const useCreateToken = () => {
  // ── wallet-adapter hooks ─────────────────────────────────────────────────
  const { connection } = useConnection();
  const {
    publicKey,       // connected wallet's PublicKey
    sendTransaction, // signs + broadcasts via the wallet extension
    connected,       // boolean
    wallet,          // adapter instance  (wallet.adapter.name etc.)
  } = useWallet();

  // ── local state ──────────────────────────────────────────────────────────
  const [tokenInfo, setTokenInfo]   = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress]     = useState("");
  const [error, setError]           = useState(null);

  // ── restore from localStorage on mount ───────────────────────────────────
  useEffect(() => {
    const saved = loadTokenInfo();
    if (saved) {
      setTokenInfo(saved);
      console.log("[useCreateToken] Restored from localStorage:", saved.mintAddress);
    }
  }, []);

  // ─── MAIN CREATE FUNCTION ─────────────────────────────────────────────────

  /**
   * createToken
   *
   * @param {object} params
   * @param {string} params.name         - e.g. "Presale Token"
   * @param {string} params.symbol       - e.g. "PSALE"
   * @param {number} params.decimals     - e.g. 6
   * @param {number} params.totalSupply  - human-readable e.g. 1_000_000
   *
   * @returns {Promise<TokenInfo>}
   */
  const createToken = useCallback(
    async ({ name = "LaunchX Coin", symbol ="LX", decimals = 9, totalSupply = 4200000000 }) => {
      if (!connected || !publicKey) {
        throw new Error("Wallet not connected. Please connect your wallet first.");
      }

      setIsCreating(true);
      setError(null);
      setProgress("");

      try {
        const step = (msg) => {
          setProgress(msg);
          console.log("[useCreateToken]", msg);
        };

        // ── 1. Generate fresh mint keypair ──────────────────────────────────
        step("Generating mint keypair...");
        const mintKeypair = Keypair.generate();

        // ── 2. Fetch rent exemption for mint account ────────────────────────
        step("Fetching rent exemption...");
        const rentLamports = await getMinimumBalanceForRentExemptMint(connection);

        // ── 3. Create + Initialize Mint ─────────────────────────────────────
        step("Creating mint account on-chain...");
        const { blockhash: bh1, lastValidBlockHeight: lbh1 } =
          await connection.getLatestBlockhash();

        const createMintTx = new Transaction({
          feePayer: publicKey,
          recentBlockhash: bh1,
        }).add(
          // Allocate the account
          SystemProgram.createAccount({
            fromPubkey:        publicKey,
            newAccountPubkey:  mintKeypair.publicKey,
            space:             MINT_SIZE,
            lamports:          rentLamports,
            programId:         TOKEN_PROGRAM_ID,
          }),
          // Mark it as a mint
          createInitializeMintInstruction(
            mintKeypair.publicKey, // mint
            decimals,              // decimals
            publicKey,             // mint authority  ← connected wallet
            publicKey,             // freeze authority ← connected wallet (pass null to disable)
            TOKEN_PROGRAM_ID
          )
        );

        // mintKeypair must co-sign (it's the new account being created)
        // wallet-adapter's sendTransaction accepts extra signers via options
        const mintTxSig = await sendTransaction(createMintTx, connection, {
          signers: [mintKeypair],
        });
        await connection.confirmTransaction(
          { signature: mintTxSig, blockhash: bh1, lastValidBlockHeight: lbh1 },
          "confirmed"
        );
        step("Mint account confirmed ✅");

        // ── 4. Derive ATA address ───────────────────────────────────────────
        step("Deriving Associated Token Account address...");
        const payerATA = await getAssociatedTokenAddress(
          mintKeypair.publicKey,
          publicKey
        );

        // ── 5. Create ATA ───────────────────────────────────────────────────
        step("Creating Associated Token Account on-chain...");
        const { blockhash: bh2, lastValidBlockHeight: lbh2 } =
          await connection.getLatestBlockhash();

        const createATATx = new Transaction({
          feePayer: publicKey,
          recentBlockhash: bh2,
        }).add(
          createAssociatedTokenAccountInstruction(
            publicKey,             // fee payer
            payerATA,              // ATA address
            publicKey,             // ATA owner
            mintKeypair.publicKey  // mint
          )
        );

        const ataTxSig = await sendTransaction(createATATx, connection);
        await connection.confirmTransaction(
          { signature: ataTxSig, blockhash: bh2, lastValidBlockHeight: lbh2 },
          "confirmed"
        );
        step("ATA confirmed ✅");

        // ── 6. Mint total supply into ATA ───────────────────────────────────
        step(`Minting ${totalSupply.toLocaleString()} ${symbol} to ATA...`);
        const rawSupply = toRawAmount(totalSupply, decimals);

        const { blockhash: bh3, lastValidBlockHeight: lbh3 } =
          await connection.getLatestBlockhash();

        const mintToTx = new Transaction({
          feePayer: publicKey,
          recentBlockhash: bh3,
        }).add(
          createMintToInstruction(
            mintKeypair.publicKey, // mint
            payerATA,              // destination ATA
            publicKey,             // mint authority (matches what we set above)
            rawSupply              // amount in raw units
          )
        );

        const mintToSig = await sendTransaction(mintToTx, connection);
        await connection.confirmTransaction(
          { signature: mintToSig, blockhash: bh3, lastValidBlockHeight: lbh3 },
          "confirmed"
        );
        step("Supply minted ✅");

        // ── 7. Verify on-chain ──────────────────────────────────────────────
        step("Verifying on-chain data...");
        const mintOnChain = await getMint(connection, mintKeypair.publicKey);

        // ── 8. Detect network from RPC url ──────────────────────────────────
        const rpc = connection.rpcEndpoint;
        const network = rpc.includes("devnet")
          ? "devnet"
          : rpc.includes("mainnet")
          ? "mainnet-beta"
          : rpc.includes("testnet")
          ? "testnet"
          : "custom";

        // ── 9. Assemble token info ──────────────────────────────────────────
        const info = {
          // Identity
          name,
          symbol,
          decimals,

          // Key addresses
          mintAddress:            mintKeypair.publicKey.toBase58(),
          mintAuthority:          publicKey.toBase58(),
          freezeAuthority:        publicKey.toBase58(),
          ownerAddress:           publicKey.toBase58(),
          associatedTokenAccount: payerATA.toBase58(),

          // Supply
          totalSupplyHuman: totalSupply,
          totalSupplyRaw:   rawSupply.toString(),
          onChainSupply:    mintOnChain.supply.toString(),

          // TX signatures
          transactions: {
            createMint: mintTxSig,
            createATA:  ataTxSig,
            mintTokens: mintToSig,
          },

          // ── Meteora SDK fields ──────────────────────────────────────────
          // Drop these directly into Meteora vault / DLMM pool creation
          meteora: {
            tokenMint:         mintKeypair.publicKey.toBase58(), // baseMint
            tokenProgram:      TOKEN_PROGRAM_ID.toBase58(),
            tokenDecimals:     decimals,
            ownerTokenAccount: payerATA.toBase58(),              // source ATA for vault deposit
          },

          // Mint keypair secret — needed if vault creation requires mint authority signing
          // WARNING: keep this private, never expose publicly
          mintKeypairSecret: Array.from(mintKeypair.secretKey),

          // Wallet
          walletName: wallet?.adapter?.name || "unknown",

          // Meta
          network,
          createdAt: new Date().toISOString(),

          // Explorer links
          explorerLinks: {
            mint:    `https://explorer.solana.com/address/${mintKeypair.publicKey.toBase58()}?cluster=${network}`,
            ata:     `https://explorer.solana.com/address/${payerATA.toBase58()}?cluster=${network}`,
            mintTx:  `https://explorer.solana.com/tx/${mintTxSig}?cluster=${network}`,
            ataTx:   `https://explorer.solana.com/tx/${ataTxSig}?cluster=${network}`,
            mintToTx:`https://explorer.solana.com/tx/${mintToSig}?cluster=${network}`,
          },
        };

        // ── 10. Save to localStorage + state ───────────────────────────────
        saveTokenInfo(info);
        setTokenInfo(info);
        step("Done! Token info saved to localStorage ✅");

        return info;

      } catch (err) {
        const msg = err?.message || "Token creation failed.";
        console.error("[useCreateToken] Error:", err);
        setError(msg);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [connected, publicKey, sendTransaction, connection, wallet]
  );

  // ─── CLEAR ────────────────────────────────────────────────────────────────

  const clearToken = useCallback(() => {
    clearTokenInfo();
    setTokenInfo(null);
    setError(null);
    setProgress("");
  }, []);

  // ─── RETURN ───────────────────────────────────────────────────────────────

  return {
    createToken,  // async ({ name, symbol, decimals, totalSupply }) => TokenInfo
    tokenInfo,    // null | TokenInfo  ← auto-restored on mount
    isCreating,   // boolean
    progress,     // string  ← current step label
    error,        // string | null
    clearToken,   // () => void  ← wipes state + localStorage
    connected,    // boolean  ← use to disable your button
    publicKey,    // PublicKey | null
  };
};

export default useCreateToken;

// ─── EXAMPLE COMPONENT ───────────────────────────────────────────────────────
//
// import useCreateToken from "./useCreateToken";
//
// export default function CreateTokenPanel() {
//   const {
//     createToken, tokenInfo, isCreating, progress, error, connected
//   } = useCreateToken();
//
//   const handleCreate = async () => {
//     try {
//       const info = await createToken({
//         name: "Presale Token",
//         symbol: "PSALE",
//         decimals: 6,
//         totalSupply: 1_000_000,
//       });
//       console.log("Mint:", info.mintAddress);
//       // Next → pass info.meteora.tokenMint to vault creation
//     } catch (e) {
//       // error already set in hook state
//     }
//   };
//
//   return (
//     <div>
//       <button onClick={handleCreate} disabled={!connected || isCreating}>
//         {isCreating ? progress : "Create Token"}
//       </button>
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       {tokenInfo && <p>Mint: {tokenInfo.mintAddress}</p>}
//     </div>
//   );
// }