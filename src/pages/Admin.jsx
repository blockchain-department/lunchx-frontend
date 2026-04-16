import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  ComputeBudgetProgram,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createInitializeMintInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
} from '@solana/spl-token';
import {
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
} from '@metaplex-foundation/mpl-token-metadata';
import { Presale } from '@meteora-ag/presale';
import { BN } from 'bn.js';
import toast from 'react-hot-toast';
import {
  Loader2, ShieldCheck, BarChart3, Settings, PlusCircle,
  Download, Coins, Users, TrendingUp, Lock, Flame,
  RotateCcw, DollarSign, AlertCircle, Copy, CheckCircle2, RefreshCw,
  PackagePlus, Zap, XCircle, Circle, MinusCircle,
} from 'lucide-react';
import { PRESALE_PROGRAM_ID, PRESALE_VAULT_PDA, TOKEN_METADATA_URI } from '../utilities/config';

const WSOL_MINT = 'So11111111111111111111111111111111111111112';

// Decimal places for known quote mints. Used to convert on-chain smallest-unit amounts
// (presaleMaximumCap, presaleTotalDeposit, presaleMinimumCap) to display values.
// Add any additional quote mint here to get correct stats display; unknown mints fall
// back to 9 (same as before) with a DEV-mode console.warn so QA can catch gaps early.
// NOTE: this map is for the *quote* token only. Base-token supply still assumes 9 decimals
// (dec = 1e9 in fetchStats) — add a separate base-mint decimal lookup if that ever changes.
const KNOWN_QUOTE_DECIMALS = {
  [WSOL_MINT]:                                         9,  // Wrapped SOL
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v':    6,  // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB':     6,  // USDT
};
// Maps PresaleProgress enum (0–3) to display strings.
// SDK: NotStarted=0, Ongoing=1, Completed=2, Failed=3
const STATE_LABELS = ['Not Started', 'Ongoing', 'Completed', 'Failed'];
const STATE_COLORS = ['text-tertiary/50', 'text-green-400', 'text-blue-400', 'text-red-400'];

const cls = {
  input: 'w-full bg-tertiary/5 border border-tertiary/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors placeholder:text-tertiary/40',
  label: 'block text-xs text-tertiary/60 mb-1.5',
  card: 'bg-tertiary/5 border border-tertiary/10 rounded-2xl p-6',
};

// Token-2022 mint + metadata init often exceeds the default ~200k CU; Phantom surfaces that as "Unexpected error".
const DEPLOY_COMPUTE_UNITS = 600_000;
const DEPLOY_MIN_FEE_BUFFER_LAMPORTS = 20_000_000; // 0.02 SOL buffer for tx fees/retries

/** Pull useful text from WalletSendTransactionError / nested SendTransactionError (Phantom often wraps the real reason). */
function formatSolanaSendError(err) {
  const inner = err?.error?.error ?? err?.error ?? err;
  const logs = inner?.transactionLogs ?? inner?.logs;
  if (Array.isArray(logs) && logs.length) {
    return logs.slice(-10).join(' · ');
  }
  if (inner?.transactionMessage) return String(inner.transactionMessage);
  if (inner?.message && !/^unexpected error$/i.test(String(inner.message).trim())) {
    return inner.message;
  }
  return (
    err?.message ??
    'Check devnet SOL for rent + fees, wallet on Devnet, then approve each signature.'
  );
}

function lamportsToSol(lamports) {
  return Number(lamports || 0) / 1e9;
}

// Step status: 'idle' | 'pending' | 'done' | 'error' | 'skipped'
const INITIAL_DEPLOY_STEPS = [
  { id: 'mint',     label: 'Create mint account'                      },
  { id: 'metadata', label: 'Set token metadata (name / symbol / URI)' },
  { id: 'supply',   label: 'Create token account & mint full supply'  },
  { id: 'revoke',   label: 'Disable mint authority (fixed supply)'    },
];

const INITIAL_TOKEN_FORM = {
  tokenName:   'LaunchX Coin',
  tokenSymbol: 'LX',
  metadataUri: TOKEN_METADATA_URI,
  mintSupply:  '4200000000',
  decimals:    '9',
  revokeMint:  true,
};

const INITIAL_FORM = {
  baseMint: '',
  quoteMint: WSOL_MINT,
  presaleType: 'fcfs',
  hardcap: '',
  softcap: '',
  startTime: '',
  endTime: '',
  totalSupply: '',
  tokenDecimals: '9',
  minDeposit: '',
  maxDeposit: '',
  depositFeeBps: '0',
  whitelistMode: '0',
  unsoldTokenAction: '0',
  enableVesting: false,
  immediateReleaseBps: '5000',
  lockDuration: '0',
  vestDuration: '1296000',
  immediateReleaseTimestamp: '',
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function shortAddr(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
}

/** Returns 'SOL' for WSOL, otherwise a truncated mint address. Never hard-codes "SOL". */
function quoteLabel(mintAddr) {
  if (!mintAddr || mintAddr === WSOL_MINT) return 'SOL';
  return shortAddr(mintAddr);
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className={cls.card}>
      <div className="flex items-center gap-2 text-tertiary/50 text-xs mb-2">
        <Icon size={12} />
        {label}
      </div>
      <div className="font-bold text-lg break-all">{value}</div>
    </div>
  );
}

function ActionCard({ icon: Icon, iconColor = 'text-primary', borderColor = 'border-primary', title, description, btnLabel, btnActive, loading, loadingLabel, onClick }) {
  return (
    <div className={cls.card}>
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 p-3 rounded-xl">
          <Icon size={24} className={iconColor} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold mb-1">{title}</h3>
          <p className="text-sm text-tertiary/60 mb-4">{description}</p>
          <button
            onClick={onClick}
            disabled={!btnActive || loading}
            className={`px-6 py-3 rounded-full font-semibold text-sm border ${borderColor} ${iconColor} bg-secondary/20 flex items-center gap-2 transition-all
              ${!btnActive || loading ? 'cursor-not-allowed opacity-40' : 'hover:scale-[1.02] cursor-pointer active:scale-[0.98]'}`}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
            {loading ? loadingLabel : btnLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const Admin = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, signTransaction, connected } = useWallet();

  const [activeTab, setActiveTab] = useState('stats');
  const [presaleInstance, setPresaleInstance] = useState(null);
  const [stats, setStats] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newVaultAddress, setNewVaultAddress] = useState('');
  // null  → use PRESALE_VAULT_PDA from env (default)
  // string → use this PDA (set immediately after a successful Create)
  const [statsVaultOverride, setStatsVaultOverride] = useState(null);

  const [inProgress, setInProgress] = useState({
    create: false,
    withdraw: false,
    collectFee: false,
    unsoldAction: false,
  });

  const [form, setForm] = useState(INITIAL_FORM);

  // ── Token deploy state ──────────────────────────────────────────────────────
  const [tokenForm, setTokenForm]     = useState(INITIAL_TOKEN_FORM);
  const [deploySteps, setDeploySteps] = useState(
    INITIAL_DEPLOY_STEPS.map(s => ({ ...s, status: 'idle' }))
  );
  const [deployedMint, setDeployedMint] = useState('');
  const [isDeploying,  setIsDeploying]  = useState(false);

  const inProgressAny = Object.values(inProgress).some(Boolean);

  // ── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (connected && publicKey) {
      fetchStats();
    } else {
      setStats(null);
      setIsCreator(false);
      setPresaleInstance(null);
      setStatsVaultOverride(null);  // revert to env vault on disconnect
    }
  }, [connected, publicKey?.toBase58()]);

  // ── Data fetching ────────────────────────────────────────────────────────────

  /**
   * Load presale stats.
   * @param {string|null} explicitVault  Vault PDA to load for this call only.
   *   Pass the new address immediately after create to avoid the stale-closure
   *   window before setStatsVaultOverride has settled. When null, reads
   *   statsVaultOverride state, then falls back to env PRESALE_VAULT_PDA.
   */
  const fetchStats = async (explicitVault = null) => {
    const targetVault = explicitVault ?? statsVaultOverride ?? PRESALE_VAULT_PDA;
    setLoadingStats(true);
    try {
      const inst = await Presale.create(
        connection,
        new PublicKey(targetVault),
        new PublicKey(PRESALE_PROGRAM_ID)
      );

      const parsed    = inst.getParsedPresale();
      const registries = await parsed.getAllPresaleRegistries();
      const allEscrows = await inst.getEscrowsByPresale();
      const state      = parsed.getPresaleProgressState();

      // SDK decodes presale account with `owner` (creator wallet). Older code used `creator`.
      const creatorPk =
        parsed.presaleAccount.owner ?? parsed.presaleAccount.creator;
      const reg       = registries[0];

      // Read quote mint first — needed to pick the right divisor for quote-denominated fields.
      const quoteMint = parsed.presaleAccount.quoteMint?.toBase58() ?? WSOL_MINT;
      if (import.meta.env.DEV && !(quoteMint in KNOWN_QUOTE_DECIMALS)) {
        console.warn(
          `[Admin] Unknown quote mint ${quoteMint} — add it to KNOWN_QUOTE_DECIMALS for correct display. Falling back to 9 decimals.`
        );
      }
      // quoteDec: divisor for presaleMaximumCap, presaleTotalDeposit, presaleMinimumCap
      //           (all denominated in quote-token smallest units on-chain)
      const quoteDec  = Math.pow(10, KNOWN_QUOTE_DECIMALS[quoteMint] ?? 9);
      // dec: divisor for presaleSupply (base token). Assumes base mint decimals = 9.
      // If your base mint uses different decimals, add a base-mint decimal lookup here —
      // KNOWN_QUOTE_DECIMALS does not cover the base token.
      const dec       = 1e9;

      const hardcap   = Number(reg.presaleMaximumCap)                         / quoteDec;
      const deposited = Number(reg.presaleTotalDeposit)                        / quoteDec;
      const supply    = Number(reg.presaleSupply ?? 0)                         / dec;
      const softcap   = Number(parsed.presaleAccount.presaleMinimumCap ?? 0)   / quoteDec;
      const endTs     = Number(parsed.presaleAccount.presaleEndTime)   * 1000;
      const startTs   = Number(parsed.presaleAccount.presaleStartTime) * 1000;

      const creatorStr = creatorPk?.toBase58?.() ?? '';
      if (!creatorStr) {
        throw new Error('Presale account has no owner pubkey');
      }

      setStats({
        creator:      creatorStr,
        hardcap,
        softcap,
        deposited,
        supply,
        participants: allEscrows.length,
        state,
        endTs,
        startTs,
        quoteMint,
        activeVault:  targetVault,
        progress:     hardcap > 0 ? (deposited / hardcap) * 100 : 0,
      });

      setPresaleInstance(inst);

      setIsCreator(
        !!(publicKey && creatorStr === publicKey.toBase58())
      );
    } catch (err) {
      console.log(err);
      toast.error('Failed to load presale data');
    } finally {
      setLoadingStats(false);
    }
  };

  /** Revert Stats tab back to the env vault (clears any post-create override). */
  const resetToEnvVault = () => {
    setStatsVaultOverride(null);
    fetchStats(PRESALE_VAULT_PDA);
  };

  // ── Tx helper ────────────────────────────────────────────────────────────────

  const sendTx = async (tx, extraSigners = []) => {
    if (!publicKey) {
      const msg = 'Wallet not ready. Reconnect your wallet and try again.';
      toast.error(msg);
      throw new Error(msg);
    }

    const hasComputeIx = tx.instructions.some((ix) =>
      ix.programId.equals(ComputeBudgetProgram.programId),
    );
    if (!hasComputeIx) {
      tx.instructions.unshift(
        ComputeBudgetProgram.setComputeUnitLimit({ units: DEPLOY_COMPUTE_UNITS }),
      );
    }

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash      = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    tx.feePayer             = publicKey;

    let sig;
    if (typeof signTransaction === 'function') {
      if (extraSigners.length) tx.partialSign(...extraSigners);
      const signedTx = await signTransaction(tx);
      try {
        sig = await connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: false,
          maxRetries: 3,
          preflightCommitment: 'confirmed',
        });
      } catch (sendErr) {
        // Transaction already landed on a prior attempt — treat as success.
        if (typeof sendErr?.message === 'string' && sendErr.message.includes('already been processed')) {
          return null;
        }
        throw sendErr;
      }
    } else {
      try {
        sig = await sendTransaction(tx, connection, {
          skipPreflight: false,
          maxRetries: 3,
          preflightCommitment: 'confirmed',
          signers: extraSigners,
        });
      } catch (sendErr) {
        if (typeof sendErr?.message === 'string' && sendErr.message.includes('already been processed')) {
          return null;
        }
        throw sendErr;
      }
    }

    await connection.confirmTransaction(
      { signature: sig, blockhash, lastValidBlockHeight },
      'finalized'
    );
    return sig;
  };

  // ── Admin actions ────────────────────────────────────────────────────────────

  const handleWithdraw = async () => {
    setInProgress(p => ({ ...p, withdraw: true }));
    try {
      const tx = await presaleInstance.creatorWithdraw({ creator: publicKey });
      await sendTx(tx);
      toast.success(`${quoteLabel(stats?.quoteMint)} withdrawn successfully`);
      fetchStats();
    } catch (err) {
      console.log(err);
      toast.error('Withdrawal failed');
    } finally {
      setInProgress(p => ({ ...p, withdraw: false }));
    }
  };

  const handleCollectFee = async () => {
    setInProgress(p => ({ ...p, collectFee: true }));
    try {
      const tx = await presaleInstance.creatorCollectFee();
      await sendTx(tx);
      toast.success('Fees collected');
    } catch (err) {
      console.log(err);
      toast.error('Fee collection failed');
    } finally {
      setInProgress(p => ({ ...p, collectFee: false }));
    }
  };

  const handleUnsoldAction = async () => {
    setInProgress(p => ({ ...p, unsoldAction: true }));
    try {
      const tx = await presaleInstance.performUnsoldBaseTokenAction(publicKey);
      await sendTx(tx);
      toast.success('Unsold token action completed');
      fetchStats();
    } catch (err) {
      console.log(err);
      toast.error('Action failed');
    } finally {
      setInProgress(p => ({ ...p, unsoldAction: false }));
    }
  };

  // ── Deploy Token (Token-2022 + on-chain metadata) ──────────────────────────

  /** Mark a single step by id; leave others unchanged. */
  const setStepStatus = (id, status) =>
    setDeploySteps(prev => prev.map(s => (s.id === id ? { ...s, status } : s)));

  const handleDeployToken = async () => {
    if (!publicKey) {
      toast.error('Wallet not ready. Reconnect your wallet and try again.');
      return;
    }

    const { tokenName, tokenSymbol, metadataUri, mintSupply, decimals, revokeMint } = tokenForm;

    if (!tokenName.trim() || !tokenSymbol.trim() || !mintSupply) {
      toast.error('Name, symbol, and supply are required');
      return;
    }
    if (parseFloat(mintSupply) <= 0) {
      toast.error('Supply must be greater than 0');
      return;
    }

    setIsDeploying(true);
    setDeployedMint('');

    // Reset steps — mark revoke as skipped upfront if not requested
    setDeploySteps(INITIAL_DEPLOY_STEPS.map(s => ({
      ...s,
      status: s.id === 'mint' ? 'pending'
            : s.id === 'revoke' && !revokeMint ? 'skipped'
            : 'idle',
    })));

    const mintKeypair = Keypair.generate();
    const dec         = parseInt(decimals || '9');

    try {
      // ── Tx 1: Create mint account (standard SPL Token) ─────────────────────
      const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
      const walletBalance = await connection.getBalance(publicKey, 'confirmed');
      const neededLamports = lamports + DEPLOY_MIN_FEE_BUFFER_LAMPORTS;
      if (walletBalance < neededLamports) {
        throw new Error(
          `Insufficient SOL for deployment. Need ~${lamportsToSol(neededLamports).toFixed(4)} SOL, have ${lamportsToSol(walletBalance).toFixed(4)} SOL.`
        );
      }

      const tx1 = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey:       publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space:            MINT_SIZE,
          lamports,
          programId:        TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          dec,
          publicKey,
          null,             // freeze authority — null = disabled
          TOKEN_PROGRAM_ID,
        ),
      );

      await sendTx(tx1, [mintKeypair]);
      setStepStatus('mint', 'done');
      setStepStatus('metadata', 'pending');

      // ── Tx 2: Create Metaplex metadata account ─────────────────────────────
      const [metadataPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintKeypair.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID,
      );

      const tx2 = new Transaction().add(
        createCreateMetadataAccountV3Instruction(
          {
            metadata:        metadataPDA,
            mint:            mintKeypair.publicKey,
            mintAuthority:   publicKey,
            payer:           publicKey,
            updateAuthority: publicKey,
          },
          {
            createMetadataAccountArgsV3: {
              data: {
                name:                 tokenName.trim(),
                symbol:               tokenSymbol.trim().toUpperCase(),
                uri:                  metadataUri.trim(),
                sellerFeeBasisPoints: 0,
                creators:             null,
                collection:           null,
                uses:                 null,
              },
              isMutable:         true,
              collectionDetails: null,
            },
          },
        ),
      );

      await sendTx(tx2);
      setStepStatus('metadata', 'done');
      setStepStatus('supply', 'pending');

      // ── Tx 2: Create ATA + mint full supply ────────────────────────────────
      const ata = getAssociatedTokenAddressSync(
        mintKeypair.publicKey,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
      );

      // Use BigInt to safely handle supplies that overflow JS safe-integer range
      const supplyRaw = BigInt(Math.round(parseFloat(mintSupply))) * (BigInt(10) ** BigInt(dec));

      const tx3 = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          publicKey,
          ata,
          publicKey,
          mintKeypair.publicKey,
          TOKEN_PROGRAM_ID,
        ),
        createMintToInstruction(
          mintKeypair.publicKey,
          ata,
          publicKey,
          supplyRaw,
          [],
          TOKEN_PROGRAM_ID,
        ),
      );

      await sendTx(tx3);
      setStepStatus('supply', 'done');

      // ── Tx 4 (optional): Revoke mint authority ─────────────────────────────
      if (revokeMint) {
        setStepStatus('revoke', 'pending');
        const tx4 = new Transaction().add(
          createSetAuthorityInstruction(
            mintKeypair.publicKey,
            publicKey,
            AuthorityType.MintTokens,
            null,           // null = remove authority permanently
            [],
            TOKEN_PROGRAM_ID,
          ),
        );
        await sendTx(tx4);
        setStepStatus('revoke', 'done');
      }

      const mintAddr = mintKeypair.publicKey.toBase58();
      setDeployedMint(mintAddr);
      toast.success('Token deployed! Mint address copied to clipboard.');
      navigator.clipboard.writeText(mintAddr).catch(() => {});
    } catch (err) {
      console.error(err);
      const detail = formatSolanaSendError(err);
      toast.error(`Deployment failed: ${detail}`);
      // Mark the in-progress step as errored
      setDeploySteps(prev => prev.map(s => (s.status === 'pending' ? { ...s, status: 'error' } : s)));
    } finally {
      setIsDeploying(false);
    }
  };

  // ── Create presale ────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!form.baseMint || !form.startTime || !form.endTime || !form.totalSupply || !form.hardcap) {
      toast.error('Fill in all required fields (*)');
      return;
    }

    const startTs = Math.floor(new Date(form.startTime).getTime() / 1000);
    const endTs   = Math.floor(new Date(form.endTime).getTime() / 1000);

    if (endTs <= startTs) {
      toast.error('End time must be after start time');
      return;
    }

    setInProgress(p => ({ ...p, create: true }));
    setNewVaultAddress('');

    try {
      const dec            = Math.pow(10, parseInt(form.tokenDecimals || 9));
      const solDec         = 1e9;
      const presaleKeypair = Keypair.generate();

      const presaleArgs = {
        presaleMaximumCap: new BN(parseFloat(form.hardcap) * solDec),
        presaleMinimumCap: new BN(parseFloat(form.softcap || 0) * solDec),
        presaleStartTime:  new BN(startTs),
        presaleEndTime:    new BN(endTs),
        whitelistMode:     parseInt(form.whitelistMode),
        unsoldTokenAction: parseInt(form.unsoldTokenAction),
        disableEarlierPresaleEndOnceCapReached: false,
      };

      const lockedVestingArgs = form.enableVesting ? {
        immediateReleaseBps:       new BN(parseInt(form.immediateReleaseBps)),
        lockDuration:              new BN(parseInt(form.lockDuration)),
        vestDuration:              new BN(parseInt(form.vestDuration)),
        immediateReleaseTimestamp: new BN(
          form.immediateReleaseTimestamp
            ? Math.floor(new Date(form.immediateReleaseTimestamp).getTime() / 1000)
            : endTs
        ),
      } : undefined;

      const params = {
        presaleArgs,
        ...(lockedVestingArgs ? { lockedVestingArgs } : {}),
        basePubkey:        presaleKeypair.publicKey,
        baseMintPubkey:    new PublicKey(form.baseMint),
        quoteMintPubkey:   new PublicKey(form.quoteMint),
        creatorPubkey:     publicKey,
        feePayerPubkey:    publicKey,
        presaleRegistries: [{
          buyerMinimumDepositCap: new BN(parseFloat(form.minDeposit || 0) * solDec),
          buyerMaximumDepositCap: new BN(parseFloat(form.maxDeposit || form.hardcap) * solDec),
          presaleSupply:          new BN(parseFloat(form.totalSupply) * dec),
          depositFeeBps:          new BN(parseInt(form.depositFeeBps || 0)),
        }],
      };

      const tx = form.presaleType === 'fcfs'
        ? await Presale.createFcfsPresale(connection, new PublicKey(PRESALE_PROGRAM_ID), params)
        : await Presale.createProrataPresale(connection, new PublicKey(PRESALE_PROGRAM_ID), params);

      await sendTx(tx, [presaleKeypair]);

      const vaultAddr = presaleKeypair.publicKey.toBase58();
      setNewVaultAddress(vaultAddr);
      // Point Stats at the new vault and switch there for immediate verification.
      // Pass vaultAddr explicitly to fetchStats to avoid the stale-closure window
      // before setStatsVaultOverride has settled in React state.
      setStatsVaultOverride(vaultAddr);
      setActiveTab('stats');
      await fetchStats(vaultAddr);
      toast.success('Presale created! Stats tab now shows the new vault.');
    } catch (err) {
      console.log(err);
      toast.error('Presale creation failed');
    } finally {
      setInProgress(p => ({ ...p, create: false }));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const setField      = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const setTokenField = (key) => (e) => setTokenForm(f => ({ ...f, [key]: e.target.value }));

  // ── Not connected ─────────────────────────────────────────────────────────────

  if (!connected) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col items-center justify-center gap-6 px-4">
        <div className="bg-primary/10 p-5 rounded-2xl">
          <ShieldCheck size={48} className="text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-tertiary mb-2">Admin Dashboard</h1>
          <p className="text-tertiary/50 mb-6">Connect your creator wallet to access the admin panel</p>
          <WalletMultiButton />
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'stats',  label: 'Stats',         Icon: BarChart3   },
    { id: 'token',  label: 'Deploy Token',  Icon: PackagePlus },
    { id: 'create', label: 'Create Presale', Icon: PlusCircle },
    { id: 'manage', label: 'Manage',         Icon: Settings    },
  ];

  // Derived quote labels — computed once per render to stay consistent across the template
  const ql  = quoteLabel(stats?.quoteMint);   // label from live on-chain data (Stats / Manage)
  const fql = quoteLabel(form.quoteMint);     // label from the Create form's current input

  // ── Main render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-secondary text-tertiary pt-24 pb-16 px-4 font-sans">
      <div className="max-w-4xl mx-auto">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck size={28} className="text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              {isCreator
                ? <span className="text-xs text-green-400">Creator wallet connected</span>
                : <span className="text-xs text-yellow-400">Read-only — connect creator wallet for actions</span>
              }
            </div>
          </div>
          <WalletMultiButton />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer
                ${activeTab === id ? 'bg-primary text-secondary' : 'bg-tertiary/10 text-tertiary hover:bg-tertiary/20'}`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* ── STATS TAB ─────────────────────────────────────────── */}
        {activeTab === 'stats' && (
          <div className="space-y-4">

            {/* Post-create override banner */}
            {statsVaultOverride && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-blue-400 text-sm">
                  <CheckCircle2 size={16} />
                  <span>
                    Showing newly created vault —{' '}
                    <span className="font-mono">{shortAddr(statsVaultOverride)}</span>
                  </span>
                </div>
                <button
                  onClick={resetToEnvVault}
                  className="flex items-center gap-1.5 text-xs text-tertiary/60 hover:text-tertiary border border-tertiary/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  <RefreshCw size={12} />
                  Use env vault
                </button>
              </div>
            )}

            {loadingStats ? (
              <div className="flex justify-center py-24">
                <Loader2 size={36} className="animate-spin text-primary" />
              </div>
            ) : stats ? (
              <>
                {/* Progress card */}
                <div className={cls.card}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-tertiary/60">Presale State</span>
                    <span className={`font-bold text-lg ${STATE_COLORS[stats.state] ?? 'text-tertiary'}`}>
                      {STATE_LABELS[stats.state] ?? 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs mb-2 text-tertiary/70">
                    <span>Progress: {stats.progress.toFixed(2)}%</span>
                    <span>Hard Cap: {stats.hardcap} {ql}</span>
                  </div>
                  <div className="w-full bg-tertiary/10 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-primary/60 h-full rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                      style={{ width: `${Math.min(stats.progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <StatCard label="Total Deposited" value={`${stats.deposited.toFixed(4)} ${ql}`} icon={TrendingUp} />
                  <StatCard label="Hard Cap"         value={`${stats.hardcap} ${ql}`}             icon={Lock}       />
                  <StatCard label="Soft Cap"         value={`${stats.softcap} ${ql}`}             icon={Lock}       />
                  <StatCard label="Token Supply"     value={stats.supply.toLocaleString()}        icon={Coins}      />
                  <StatCard label="Participants"     value={stats.participants}                   icon={Users}      />
                  <StatCard label="State"            value={STATE_LABELS[stats.state] ?? '—'}    icon={BarChart3}  />
                </div>

                {/* Detail info */}
                <div className={`${cls.card} space-y-3 text-sm`}>
                  {[
                    ['Creator',      shortAddr(stats.creator),                  stats.creator],
                    ['Vault PDA',    shortAddr(stats.activeVault),              stats.activeVault],
                    // Show quote token row with copy only when it's not WSOL (WSOL is obvious from "SOL")
                    ['Quote Token',  ql,  stats.quoteMint !== WSOL_MINT ? stats.quoteMint : null],
                    ['Start Time',   new Date(stats.startTs).toLocaleString(),  null],
                    ['End Time',     new Date(stats.endTs).toLocaleString(),    null],
                  ].map(([label, display, copyVal]) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-tertiary/50">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{display}</span>
                        {copyVal && (
                          <button
                            onClick={() => copyToClipboard(copyVal)}
                            className="text-tertiary/40 hover:text-primary transition-colors cursor-pointer"
                          >
                            {copied ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Refresh */}
                <button
                  onClick={() => fetchStats()}
                  disabled={loadingStats}
                  className="w-full py-3 rounded-xl text-sm text-tertiary/60 border border-tertiary/10 bg-tertiary/5 flex items-center justify-center gap-2 hover:bg-tertiary/10 transition-all cursor-pointer"
                >
                  <RotateCcw size={14} />
                  Refresh
                </button>
              </>
            ) : (
              <div className="text-center py-24 text-tertiary/40">
                <AlertCircle size={40} className="mx-auto mb-3" />
                <p>Could not load presale data</p>
                <button onClick={() => fetchStats()} className="mt-4 text-primary text-sm underline cursor-pointer">
                  Try again
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── DEPLOY TOKEN TAB ──────────────────────────────────── */}
        {activeTab === 'token' && (
          <div className="space-y-6">

            {/* Header */}
            <div className={cls.card}>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-xl shrink-0">
                  <PackagePlus size={24} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-lg mb-1">Deploy Token-2022</h2>
                  <p className="text-sm text-tertiary/60 leading-relaxed">
                    Creates a Token-2022 mint with on-chain metadata (name, symbol, image URI)
                    in <span className="text-primary font-semibold">3 wallet approvals</span>.
                    The mint address is what you paste into the "Base Token Mint" field in Create Presale.
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className={`${cls.card} space-y-5`}>
              <h3 className="font-semibold text-sm text-tertiary/70 uppercase tracking-wide">Token Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={cls.label}>Token Name *</label>
                  <input
                    className={cls.input}
                    placeholder="e.g. LaunchX Coin"
                    value={tokenForm.tokenName}
                    onChange={setTokenField('tokenName')}
                    disabled={isDeploying}
                  />
                </div>
                <div>
                  <label className={cls.label}>Symbol * (auto-uppercased)</label>
                  <input
                    className={cls.input}
                    placeholder="e.g. LX"
                    value={tokenForm.tokenSymbol}
                    onChange={setTokenField('tokenSymbol')}
                    disabled={isDeploying}
                  />
                </div>
              </div>

              <div>
                <label className={cls.label}>Metadata URI (image / off-chain JSON)</label>
                <input
                  className={cls.input}
                  placeholder="https://ipfs.io/ipfs/..."
                  value={tokenForm.metadataUri}
                  onChange={setTokenField('metadataUri')}
                  disabled={isDeploying}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={cls.label}>Total Supply * (display units)</label>
                  <input
                    type="number"
                    className={cls.input}
                    placeholder="e.g. 4200000000"
                    value={tokenForm.mintSupply}
                    onChange={setTokenField('mintSupply')}
                    disabled={isDeploying}
                  />
                </div>
                <div>
                  <label className={cls.label}>Decimals (default: 9)</label>
                  <input
                    type="number"
                    className={cls.input}
                    min="0"
                    max="9"
                    value={tokenForm.decimals}
                    onChange={setTokenField('decimals')}
                    disabled={isDeploying}
                  />
                </div>
              </div>

              {/* Revoke mint toggle */}
              <div className="flex items-center justify-between bg-tertiary/5 border border-tertiary/10 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">Disable Mint Authority</p>
                  <p className="text-xs text-tertiary/50 mt-0.5">
                    Permanently locks supply — no more tokens can ever be minted. Recommended for presales.
                  </p>
                </div>
                <button
                  onClick={() => setTokenForm(f => ({ ...f, revokeMint: !f.revokeMint }))}
                  disabled={isDeploying}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer
                    ${tokenForm.revokeMint ? 'bg-primary text-secondary' : 'bg-tertiary/10 text-tertiary'}`}
                >
                  {tokenForm.revokeMint ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>

            {/* Step tracker */}
            <div className={cls.card}>
              <h3 className="font-semibold text-sm text-tertiary/70 uppercase tracking-wide mb-4">Deployment Steps</h3>
              <div className="space-y-3">
                {deploySteps.map((step, idx) => {
                  const StepIcon =
                    step.status === 'done'    ? CheckCircle2 :
                    step.status === 'error'   ? XCircle      :
                    step.status === 'skipped' ? MinusCircle  :
                    step.status === 'pending' ? Loader2      :
                    Circle;
                  const color =
                    step.status === 'done'    ? 'text-green-400' :
                    step.status === 'error'   ? 'text-red-400'   :
                    step.status === 'skipped' ? 'text-tertiary/30' :
                    step.status === 'pending' ? 'text-primary'   :
                    'text-tertiary/30';
                  return (
                    <div key={step.id} className="flex items-center gap-3">
                      <StepIcon
                        size={18}
                        className={`shrink-0 ${color} ${step.status === 'pending' ? 'animate-spin' : ''}`}
                      />
                      <span className={`text-sm ${step.status === 'skipped' ? 'line-through text-tertiary/30' : step.status === 'idle' ? 'text-tertiary/40' : 'text-tertiary'}`}>
                        <span className="text-tertiary/40 mr-1.5">{idx + 1}.</span>
                        {step.label}
                        {step.status === 'skipped' && <span className="ml-2 text-xs">(skipped)</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Deploy button */}
            <button
              onClick={handleDeployToken}
              disabled={isDeploying}
              className={`w-full py-4 rounded-full font-bold text-lg border border-primary text-primary bg-secondary/20
                flex items-center justify-center gap-2 transition-all
                ${isDeploying ? 'cursor-not-allowed opacity-60' : 'hover:scale-[1.01] cursor-pointer active:scale-[0.99]'}`}
            >
              {isDeploying ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} />}
              {isDeploying ? 'Deploying...' : 'Deploy Token'}
            </button>

            {/* Result card */}
            {deployedMint && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 space-y-4">
                <p className="text-green-400 font-semibold flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  Token deployed successfully!
                </p>

                {/* Mint address */}
                <div>
                  <p className="text-xs text-tertiary/50 mb-1.5">Mint Address</p>
                  <div className="flex items-center gap-2 bg-tertiary/5 border border-tertiary/10 rounded-lg px-3 py-2">
                    <span className="font-mono text-xs flex-1 break-all text-tertiary">{deployedMint}</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(deployedMint); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      className="text-tertiary/50 hover:text-primary cursor-pointer shrink-0"
                    >
                      {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                {/* Quick-fill action */}
                <button
                  onClick={() => {
                    setForm(f => ({ ...f, baseMint: deployedMint, tokenDecimals: tokenForm.decimals }));
                    setActiveTab('create');
                    toast.success('Base Token Mint pre-filled in Create Presale');
                  }}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold border border-primary/40 text-primary bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <PlusCircle size={15} />
                  Use as Base Token in Create Presale
                </button>
              </div>
            )}

          </div>
        )}

        {/* ── CREATE TAB ────────────────────────────────────────── */}
        {activeTab === 'create' && (
          <div className={`${cls.card} space-y-6`}>
            <h2 className="font-bold text-lg flex items-center gap-2">
              <PlusCircle size={20} className="text-primary" />
              Create New Presale
            </h2>

            {/* Presale type */}
            <div>
              <label className={cls.label}>Presale Type</label>
              <div className="flex gap-3">
                {[['fcfs', 'FCFS'], ['prorata', 'Pro-Rata']].map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => setForm(f => ({ ...f, presaleType: val }))}
                    className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer
                      ${form.presaleType === val ? 'bg-primary text-secondary' : 'bg-tertiary/10 text-tertiary hover:bg-tertiary/20'}`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Token info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={cls.label}>Base Token Mint * (the token you are selling)</label>
                <input className={cls.input} placeholder="e.g. LX token mint address" value={form.baseMint} onChange={setField('baseMint')} />
              </div>
              <div>
                <label className={cls.label}>Quote Token Mint (payment token — default WSOL)</label>
                <input className={cls.input} value={form.quoteMint} onChange={setField('quoteMint')} />
              </div>
              <div>
                <label className={cls.label}>Token Decimals (default: 9)</label>
                <input type="number" className={cls.input} value={form.tokenDecimals} onChange={setField('tokenDecimals')} />
              </div>
            </div>

            {/* Caps & timing — labels use fql so they update when quoteMint changes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={cls.label}>Hard Cap * ({fql})</label>
                <input type="number" className={cls.input} placeholder="e.g. 500" value={form.hardcap} onChange={setField('hardcap')} />
              </div>
              <div>
                <label className={cls.label}>Soft Cap ({fql})</label>
                <input type="number" className={cls.input} placeholder="e.g. 100" value={form.softcap} onChange={setField('softcap')} />
              </div>
              <div>
                <label className={cls.label}>Start Time *</label>
                <input type="datetime-local" className={cls.input} value={form.startTime} onChange={setField('startTime')} />
              </div>
              <div>
                <label className={cls.label}>End Time *</label>
                <input type="datetime-local" className={cls.input} value={form.endTime} onChange={setField('endTime')} />
              </div>
            </div>

            {/* Supply & limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={cls.label}>Total Token Supply * (tokens to sell)</label>
                <input type="number" className={cls.input} placeholder="e.g. 10000000" value={form.totalSupply} onChange={setField('totalSupply')} />
              </div>
              <div>
                <label className={cls.label}>Deposit Fee (basis points, 100 = 1%)</label>
                <input type="number" className={cls.input} placeholder="0" value={form.depositFeeBps} onChange={setField('depositFeeBps')} />
              </div>
              <div>
                <label className={cls.label}>Min Deposit per Wallet ({fql})</label>
                <input type="number" className={cls.input} placeholder="0" value={form.minDeposit} onChange={setField('minDeposit')} />
              </div>
              <div>
                <label className={cls.label}>Max Deposit per Wallet ({fql})</label>
                <input type="number" className={cls.input} placeholder="e.g. 50" value={form.maxDeposit} onChange={setField('maxDeposit')} />
              </div>
            </div>

            {/* Whitelist + unsold */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={cls.label}>Whitelist Mode</label>
                <select className={cls.input} value={form.whitelistMode} onChange={setField('whitelistMode')}>
                  <option value="0">Permissionless (Public)</option>
                  <option value="1">Merkle Proof Whitelist</option>
                  <option value="2">Authority Whitelist</option>
                </select>
              </div>
              <div>
                <label className={cls.label}>Unsold Token Action</label>
                <select className={cls.input} value={form.unsoldTokenAction} onChange={setField('unsoldTokenAction')}>
                  <option value="0">Refund to Creator</option>
                  <option value="1">Burn</option>
                </select>
              </div>
            </div>

            {/* Vesting */}
            <div className="bg-tertiary/5 border border-tertiary/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm flex items-center gap-2">
                  <Lock size={14} className="text-primary" />
                  Vesting Schedule
                </span>
                <button
                  onClick={() => setForm(f => ({ ...f, enableVesting: !f.enableVesting }))}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer
                    ${form.enableVesting ? 'bg-primary text-secondary' : 'bg-tertiary/10 text-tertiary'}`}
                >
                  {form.enableVesting ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              {form.enableVesting && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className={cls.label}>Immediate Release (bps — 5000 = 50%)</label>
                    <input type="number" className={cls.input} value={form.immediateReleaseBps} onChange={setField('immediateReleaseBps')} />
                  </div>
                  <div>
                    <label className={cls.label}>Lock Duration (seconds, 0 = none)</label>
                    <input type="number" className={cls.input} value={form.lockDuration} onChange={setField('lockDuration')} />
                  </div>
                  <div>
                    <label className={cls.label}>Vest Duration (seconds — 1296000 = 15 days)</label>
                    <input type="number" className={cls.input} value={form.vestDuration} onChange={setField('vestDuration')} />
                  </div>
                  <div>
                    <label className={cls.label}>Immediate Release Timestamp (defaults to end time)</label>
                    <input type="datetime-local" className={cls.input} value={form.immediateReleaseTimestamp} onChange={setField('immediateReleaseTimestamp')} />
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleCreate}
              disabled={inProgress.create || inProgressAny}
              className={`w-full py-4 rounded-full font-bold text-lg border border-primary text-primary bg-secondary/20
                flex items-center justify-center gap-2 transition-all
                ${inProgress.create || inProgressAny ? 'cursor-not-allowed opacity-60' : 'hover:scale-[1.01] cursor-pointer active:scale-[0.99]'}`}
            >
              {inProgress.create ? <Loader2 className="animate-spin" /> : <PlusCircle size={20} />}
              {inProgress.create ? 'Creating Presale...' : 'Create Presale'}
            </button>

            {/* New vault address result */}
            {newVaultAddress && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <p className="text-green-400 text-sm font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Presale created! Stats tab is now showing the new vault.
                </p>
                <p className="text-xs text-tertiary/60 mb-2">
                  Set this address as <code className="bg-tertiary/10 px-1 rounded">VITE_PDA_MAINNET</code> in your .env and redeploy for the public site.
                </p>
                <div className="flex items-center gap-2 bg-tertiary/5 border border-tertiary/10 rounded-lg px-3 py-2">
                  <span className="font-mono text-xs flex-1 break-all text-tertiary">{newVaultAddress}</span>
                  <button onClick={() => copyToClipboard(newVaultAddress)} className="text-tertiary/50 hover:text-primary cursor-pointer">
                    {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-xs text-tertiary/50 mt-2">
                  After setting the env var, fund the presale's base token account by transferring your LX tokens to it.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── MANAGE TAB ────────────────────────────────────────── */}
        {activeTab === 'manage' && (
          <div className="space-y-4">

            {/* Auth warning */}
            {!isCreator && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3 text-yellow-400">
                <AlertCircle size={18} />
                <span className="text-sm">Connect the creator wallet to perform these actions.</span>
              </div>
            )}

            <ActionCard
              icon={Download}
              title="Withdraw Raised Capital"
              description={`Withdraw all ${ql} raised from the presale into your wallet. Available once the presale ends.`}
              btnLabel={`Withdraw ${ql}`}
              btnActive={isCreator}
              loading={inProgress.withdraw}
              loadingLabel="Withdrawing..."
              onClick={handleWithdraw}
            />

            <ActionCard
              icon={DollarSign}
              title="Collect Deposit Fees"
              description="Collect all deposit fees accumulated from participant contributions."
              btnLabel="Collect Fees"
              btnActive={isCreator}
              loading={inProgress.collectFee}
              loadingLabel="Collecting..."
              onClick={handleCollectFee}
            />

            <ActionCard
              icon={Flame}
              iconColor="text-red-400"
              borderColor="border-red-500"
              title="Handle Unsold Tokens"
              description="Execute the unsold token action (refund or burn) that was configured when the presale was created. Available after presale ends."
              btnLabel="Execute Unsold Action"
              btnActive={isCreator}
              loading={inProgress.unsoldAction}
              loadingLabel="Processing..."
              onClick={handleUnsoldAction}
            />

            {/* Refresh */}
            <button
              onClick={() => fetchStats()}
              disabled={loadingStats}
              className="w-full py-3 rounded-xl text-sm text-tertiary/60 border border-tertiary/10 bg-tertiary/5 flex items-center justify-center gap-2 hover:bg-tertiary/10 transition-all cursor-pointer"
            >
              {loadingStats ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
              Refresh Presale Data
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Admin;
