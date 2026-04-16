import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import {
  Presale,
  PRESALE_PROGRAM_ID,
  derivePresale,
  WhitelistMode,
  UnsoldTokenAction,
  Rounding,
  calculateMaximumQuoteAmountForPresaleSupply,
} from "@meteora-ag/presale";

import BN from "bn.js";
import Decimal from "decimal.js";

/* ============================================================
   CONFIG
============================================================ */

const CONFIG = {
  rpcUrl: "https://api.devnet.solana.com",

  creatorSecretKey: Uint8Array.from([
    214, 155, 243, 54, 0, 39, 204, 63, 111, 22, 24, 16, 59, 132, 229, 139, 102,
    168, 205, 190, 172, 220, 77, 8, 23, 60, 206, 66, 255, 101, 118, 50, 214, 39,
    229, 246, 185, 150, 1, 253, 61, 34, 196, 153, 73, 123, 238, 254, 123, 95,
    190, 80, 251, 86, 42, 143, 131, 107, 249, 102, 103, 6, 86, 84,
  ]),

  lxMintAddress: "9ztagbTouwetdBiNvbPgi9aHnYKEppA5143A1fYmP8fJ",
  quoteMintAddress: "So11111111111111111111111111111111111111112",

  startTime: Math.floor(Date.now() / 1000),
  endTime: 1776682854,

  LX_TARGET_USD: 0.0042,

  getTokenPriceInSOL(solPrice) {
    return Number((this.LX_TARGET_USD / solPrice).toFixed(10));
  },

  priceRounding: Rounding.Up,

  presaleTokenAmount: 1_050_000_000,
  tokenDecimals: 9,

  minCapSOL: 1250,
  minDepositSOL: 0,
  maxDepositSOL: null,

  immediateReleaseBps: 7500,
  lockDurationMinutes: 5,
  vestDurationMinutes: 0,

  disableWithdraw: false,
};

/* ============================================================
   HELPERS
============================================================ */

const solToBN = (sol) => new BN(Math.floor(sol * LAMPORTS_PER_SOL));

const tokenToBN = (amount, decimals) =>
  new BN(amount).mul(new BN(10).pow(new BN(decimals)));

const minutesToBN = (m) => new BN(m * 60);

/* ============================================================
   UTILITIES
============================================================ */

async function getLiveSolPrice() {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
  );

  const data = await res.json();
  const price = data?.solana?.usd;

  if (!price) throw new Error("Failed to fetch SOL price");

  console.log(`📊 SOL Price: $${price}`);
  return price;
}

/* ============================================================
   MAIN
============================================================ */

export async function main(publicKey) {
  console.log("\n🚀 LaunchX Presale Setup\n");

  /* ---------- Price ---------- */
  const solPrice = await getLiveSolPrice();
  const tokenPrice = CONFIG.getTokenPriceInSOL(solPrice);

  /* ---------- Connection ---------- */
  const connection = new Connection(CONFIG.rpcUrl, {
    commitment: "confirmed",
  });

  const creatorKeypair = { publicKey: publicKey };
  const creator = creatorKeypair.publicKey;

  // console.log(`👛 Wallet: ${creator.toBase58()}`);

  const balance = await connection.getBalance(creator);
  console.log(`💰 Balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);

  if (balance < 0.05 * LAMPORTS_PER_SOL) {
    throw new Error("Insufficient SOL balance");
  }

  /* ---------- Mints ---------- */
  const baseMint = new PublicKey(CONFIG.lxMintAddress);
  const quoteMint = new PublicKey(CONFIG.quoteMintAddress);

  /* ---------- PDA ---------- */
  const presaleAddress = derivePresale(
    baseMint,
    quoteMint,
    creator,
    PRESALE_PROGRAM_ID,
  );

  console.log(`📦 Vault: ${presaleAddress.toBase58()}`);

  /* ---------- Caps ---------- */
  const presaleSupply = tokenToBN(
    CONFIG.presaleTokenAmount,
    CONFIG.tokenDecimals,
  );

  const { maxPresaleCap } = calculateMaximumQuoteAmountForPresaleSupply(
    new Decimal(tokenPrice),
    new BN(CONFIG.tokenDecimals),
    new BN(9),
    presaleSupply,
    CONFIG.priceRounding,
  );

  const maxCapSOL = maxPresaleCap.toNumber() / LAMPORTS_PER_SOL;

  console.log(`💲 Price: ${tokenPrice} SOL`);
  console.log(`🎯 Max Raise: ${maxCapSOL.toFixed(2)} SOL\n`);

  /* ---------- Transaction ---------- */
  const tx = await Presale.createFixedPricePresale(
    connection,
    PRESALE_PROGRAM_ID,
    {
      baseMintPubkey: baseMint,
      quoteMintPubkey: quoteMint,
      creatorPubkey: publicKey,
      feePayerPubkey: publicKey,
      basePubkey: publicKey,

      presaleArgs: {
        presaleMaximumCap: maxPresaleCap,
        presaleMinimumCap: solToBN(CONFIG.minCapSOL),

        presaleStartTime: new BN(CONFIG.startTime),
        presaleEndTime: new BN(CONFIG.endTime),

        whitelistMode: WhitelistMode.Permissionless,
        unsoldTokenAction: UnsoldTokenAction.Refund,
        disableEarlierPresaleEndOnceCapReached: false,
      },

      lockedVestingArgs: {
        immediateReleaseBps: new BN(CONFIG.immediateReleaseBps),
        lockDuration: minutesToBN(CONFIG.lockDurationMinutes),
        vestDuration: minutesToBN(CONFIG.vestDurationMinutes),
        immediateReleaseTimestamp: new BN(0),
      },

      presaleRegistries: [
        {
          buyerMinimumDepositCap: new BN(1),
          buyerMaximumDepositCap: maxPresaleCap,
          presaleSupply,
          depositFeeBps: new BN(0),
        },
      ],
    },
    {
      price: new Decimal(tokenPrice),
      disableWithdraw: CONFIG.disableWithdraw,
      rounding: CONFIG.priceRounding,
    },
  );

  return tx;
}
