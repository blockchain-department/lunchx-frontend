import { BN } from 'bn.js';

export default function decimalToBN(value, decimals = 0) {
  const normalized = String(value ?? '').trim();
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    throw new Error(`Invalid numeric value: ${value}`);
  }

  const [wholePart, fractionPart = ''] = normalized.split('.');
  if (fractionPart.length > decimals) {
    const trimmed = fractionPart.slice(decimals);
    if (/[1-9]/.test(trimmed)) {
      throw new Error(`Too many decimal places: expected at most ${decimals}`);
    }
  }

  const paddedFraction = (fractionPart + '0'.repeat(decimals)).slice(0, decimals);
  const combined = `${wholePart}${paddedFraction}`.replace(/^0+(?=\d)/, '');
  return new BN(combined || '0', 10);
}
