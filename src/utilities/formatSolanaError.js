function flattenErrorMessages(err) {
  const inner = err?.error?.error ?? err?.error ?? err;
  const logs = inner?.transactionLogs ?? inner?.logs ?? err?.logs;
  const messages = [
    err?.message,
    inner?.message,
    inner?.transactionMessage,
    inner?.cause?.message,
    Array.isArray(logs) ? logs.join(' ') : '',
  ].filter(Boolean);

  return {
    joined: messages.join(' | '),
    logs: Array.isArray(logs) ? logs : [],
  };
}

function matchAny(text, patterns) {
  return patterns.some((pattern) => text.includes(pattern));
}

export default function formatSolanaError(err) {
  const { joined, logs } = flattenErrorMessages(err);
  const normalized = joined.toLowerCase();

  if (
    matchAny(normalized, [
      'user rejected',
      'user declined',
      'user denied',
      'request rejected',
      'cancelled',
      'canceled',
      'rejected the request',
    ])
  ) {
    return 'Transaction cancelled in wallet.';
  }

  if (
    matchAny(normalized, [
      'insufficient funds',
      'insufficient sol',
      'insufficient balance',
      'insufficient lamports',
      'rent-exempt',
      'exempt',
    ])
  ) {
    return 'Insufficient SOL to cover the transaction amount and network fees.';
  }

  if (
    matchAny(normalized, [
      'blockhash not found',
      'transaction expired',
      'lastvalidblockheight exceeded',
      'timed out',
      'timeout',
      'node is behind',
      '429',
      'too many requests',
      'rpc',
      'node is unhealthy',
      'service unavailable',
    ])
  ) {
    return 'The network is busy or the transaction expired. Please retry in a few seconds.';
  }

  if (
    matchAny(normalized, [
      'simulation failed',
      'transaction simulation failed',
      'failed to simulate',
      'simulation error',
      'custom program error',
      'anchorerror',
    ])
  ) {
    const lastProgramLog = [...logs].reverse().find((log) => /program log:|anchorerror/i.test(log));
    return lastProgramLog
      ? `Transaction simulation failed: ${lastProgramLog.replace(/^Program log:\s*/i, '')}`
      : 'Transaction simulation failed. Please review the entered values and try again.';
  }

  if (joined.trim()) {
    return joined.trim();
  }

  return 'Transaction failed. Please try again.';
}
