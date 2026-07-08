import { getAddress, isAddress } from "viem";

export function canonicalAddress(value: string) {
  const trimmed = value.trim();
  if (!isAddress(trimmed)) {
    return value;
  }

  try {
    return getAddress(trimmed);
  } catch {
    return value;
  }
}

export function sameAddress(a?: string, b?: string) {
  if (!a || !b) {
    return false;
  }
  return canonicalAddress(a).toLowerCase() === canonicalAddress(b).toLowerCase();
}
