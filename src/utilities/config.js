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
  "https://brown-sophisticated-galliform-885.mypinata.cloud/ipfs/bafkreihd4y3kt2eaomid6uaedgcbnb2biuvylhutuo3z3vewwunkac5f5i?pinataGatewayToken=WcBvwy4p_johkMIKc7l02v63-v2zgq1f1ckZfYW8GgPoTrUOMLwXYGi5e14-cX2V";
