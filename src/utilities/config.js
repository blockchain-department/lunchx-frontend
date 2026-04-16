import { PublicKey } from '@solana/web3.js';

const VALID_NETWORKS = new Set(['devnet', 'mainnet-beta']);

function normalizeNetwork(value) {
  const normalized = String(value ?? 'devnet').trim().toLowerCase();
  if (normalized === 'mainnet') return 'mainnet-beta';
  return normalized;
}

function assertValidPublicKey(value, label) {
  const normalized = String(value ?? '').trim();
  if (!normalized) {
    throw new Error(`Missing required env var for ${label}.`);
  }

  try {
    return new PublicKey(normalized).toBase58();
  } catch {
    throw new Error(`${label} must be a valid Solana public key.`);
  }
}

const resolvedNetwork = normalizeNetwork(import.meta.env.VITE_NETWORK);

if (!VALID_NETWORKS.has(resolvedNetwork)) {
  throw new Error('Invalid VITE_NETWORK. Expected "devnet" or "mainnet-beta".');
}

const resolvedRpcUrl = String(import.meta.env.VITE_RPC_URL ?? '').trim();
if (resolvedRpcUrl) {
  try {
    new URL(resolvedRpcUrl);
  } catch {
    throw new Error('VITE_RPC_URL must be a valid absolute URL when provided.');
  }
}

const selectedVaultEnvVar = resolvedNetwork === 'devnet' ? 'VITE_PDA' : 'VITE_PDA_MAINNET';
const selectedVaultValue =
  resolvedNetwork === 'devnet' ? import.meta.env.VITE_PDA : import.meta.env.VITE_PDA_MAINNET;

export const network = resolvedNetwork;
export const rpcUrl = resolvedRpcUrl || null;
export const rpc_url = rpcUrl;
export const PRESALE_PROGRAM_ID = assertValidPublicKey(
  'presSVxnf9UU8jMxhgSMqaRwNiT36qeBdNeTRKjTdbj',
  'PRESALE_PROGRAM_ID',
);
export const PRESALE_VAULT_PDA = assertValidPublicKey(
  selectedVaultValue,
  `${selectedVaultEnvVar} for ${resolvedNetwork}`,
);
export const TOKEN_METADATA_URI =
  'https://gateway.pinata.cloud/ipfs/bafkreiecr24e6jdwapydm2qplc7g7thfwaf7a4atgsffrrvpet3kdptab4';
