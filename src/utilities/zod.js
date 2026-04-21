import { z } from "zod";
import BN from "bn.js";
import decimalToBN from "./decimalToBN";

export const createDepositSchema = (solBalance) =>
  z.object({
    solAmount: z
        .union([z.string(), z.number()])
        .refine((val) => !isNaN(Number(val)), {
            message: "Please enter a valid SOL amount",
        })
        .transform((val) => Number(val))
        .refine((val) => val > 0, {
            message: "Please enter a valid amount",
        })
        .refine((val) => val <= solBalance, {
            message: "Insufficient balance",
        })
        .refine((val) => {
            try {
            decimalToBN(val, 9);
            return true;
            } catch {
            return false;
            }
        }, {
            message: "Invalid amount format",
        })
        .transform((val) => decimalToBN(val, 9)),
  });

export const createWithdrawSchema = (solBalance,depositedSol) =>
  z.object({
    solAmount: z
        .union([z.string(), z.number()])
        .refine((val) => !isNaN(Number(val)), {
            message: "Please enter a valid SOL amount",
        })
        .transform((val) => Number(val))
        .refine((val) => val > 0, {
            message: "Please enter a valid amount",
        })
        .refine((val) => val <= solBalance, {
            message: "Insufficient balance",
        })
        .refine((val) => val <= depositedSol, {
            message: "Insufficient deposited SOL",
        })
        .refine((val) => {
            try {
            decimalToBN(val, 9);
            return true;
            } catch {
            return false;
            }
        }, {
            message: "Invalid amount format",
        })
        .transform((val) => decimalToBN(val, 9)),
  });

const isValidSolanaAddress = (val) =>
  /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(val);

export const createPresaleSchema = () =>
  z
    .object({
      baseMint: z
        .string()
        .min(1, "Base mint is required")
        .refine(isValidSolanaAddress, {
          message: "Invalid Solana token mint address",
        }),

      startTime: z
        .string()
        .min(1, "Start time is required")
        .transform((val) => new Date(val)),

      endTime: z
        .string()
        .min(1, "End time is required")
        .transform((val) => new Date(val)),

      totalSupply: z
        .string()
        .min(1, "Total supply is required")
        .refine((val) => !isNaN(Number(val)), {
          message: "Total supply must be a number",
        })
        .transform((val) => Number(val))
        .refine((val) => val > 0, {
          message: "Total supply must be greater than 0",
        }),

      derivedHardCapDisplay: z
        .string()
        .min(1, "Hardcap is required")
        .refine((val) => !isNaN(Number(val)), {
          message: "Hardcap must be a number",
        })
        .transform((val) => Number(val))
        .refine((val) => val > 0, {
          message: "Hardcap must be greater than 0",
        }),
    })
    .refine((data) => data.endTime > data.startTime, {
      message: "End time must be greater than start time",
      path: ["endTime"], // attach error to endTime field
    });