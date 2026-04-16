export const network = "devnet";
export const rpc_url =
  network === "devnet"
    ? "https://api.devnet.solana.com"
    : "https://api.mainnet-beta.solana.com";
export const contract_address = "0x321a991f974616adDFDea9281Cdb3F39faa4537C";

export const PRESALE_PROGRAM_ID = "presSVxnf9UU8jMxhgSMqaRwNiT36qeBdNeTRKjTdbj";

export const PRESALE_VAULT_PDA =
  network == "devnet"
    ? import.meta.env.VITE_PDA
    : import.meta.env.VITE_PDA_MAINNET;

// Off-chain metadata JSON uploaded to Pinata IPFS.
// Contains: name, symbol, description, image, attributes.
// Used as the `uri` field when deploying the Token-2022 mint.
export const TOKEN_METADATA_URI =
  "https://gateway.pinata.cloud/ipfs/bafkreiecr24e6jdwapydm2qplc7g7thfwaf7a4atgsffrrvpet3kdptab4";
