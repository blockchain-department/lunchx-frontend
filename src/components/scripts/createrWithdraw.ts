import {
    clusterApiUrl,
    Connection,
    Keypair,
    PublicKey,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";

import {
    getAssociatedTokenAddress,
    getAccount,
} from "@solana/spl-token";

import fs from "fs";
import os from "os";

import {
    Presale,
    PRESALE_PROGRAM_ID,
} from "@meteora-ag/presale";

/* ============================================================
   CONFIG
============================================================ */

const RPC = clusterApiUrl("devnet");
const WSOL_MINT = new PublicKey(
    "So11111111111111111111111111111111111111112"
);

const PRESALE_ADDRESS = new PublicKey(
    "8Ee8czFGwH7u3C7ooX2ucNCThkGQWErkyThNBJrK7ANL"
);

/* ============================================================
   HELPERS
============================================================ */

const loadKeypair = (): Keypair => {
    const path = `${os.homedir()}/.config/solana/id.json`;
    const secret = JSON.parse(fs.readFileSync(path, "utf-8"));
    return Keypair.fromSecretKey(new Uint8Array(secret));
};

const getWSOLBalance = async (
    connection: Connection,
    owner: PublicKey
): Promise<number> => {
    try {
        const ata = await getAssociatedTokenAddress(WSOL_MINT, owner);
        const account = await getAccount(connection, ata);
        return Number(account.amount) / LAMPORTS_PER_SOL;
    } catch {
        return 0;
    }
};

/* ============================================================
   MAIN
============================================================ */

export async function creatorWithdraw() {
    const connection = new Connection(RPC, "confirmed");
    const user = loadKeypair();

    console.log(`👛 Wallet: ${user.publicKey.toBase58()}`);

    /* ---------- Balance Before ---------- */
    const before = await getWSOLBalance(connection, user.publicKey);
    console.log(`💰 Before: ${before} wSOL`);

    /* ---------- Presale Instance ---------- */
    const presale = await Presale.create(
        connection,
        PRESALE_ADDRESS,
        PRESALE_PROGRAM_ID
    );

    console.log("🚀 Withdrawing...");

    const tx = await presale.creatorWithdraw({
        creator: user.publicKey,
    });

    return tx;

    // tx.sign(user);

    // const sig = await connection.sendRawTransaction(tx.serialize());
    // await connection.confirmTransaction(sig, "finalized");

    // console.log(`✅ Tx: ${sig}`);

    // /* ---------- Balance After ---------- */
    // const after = await getWSOLBalance(connection, user.publicKey);

    // console.log(`💰 After : ${after} wSOL`);
    // console.log(`📈 Change: ${after - before} wSOL`);
}

/* ============================================================
   RUN
============================================================ */

// creatorWithdraw().catch((err) => {
//     console.error("❌", err.message || err);
// });