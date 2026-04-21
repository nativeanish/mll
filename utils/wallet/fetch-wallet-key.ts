import { HYPERBEAM, processId } from "@/utils/constant";
import decrypt from "@/utils/wallet/utils/decrypt";

const KEY_COOKIE_PREFIX = "wallet_ekey_";
const KEY_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const ACTIVE_WALLET_ADDRESS_COOKIE = "wallet_ekey_address";

type KeyCache = Record<string, string>;

export class WalletKeyFetchError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "WalletKeyFetchError";
    this.statusCode = statusCode;
  }
}

function normalizeAddress(address: string): string {
  return address.trim();
}

function normalizeStringPayload(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function makeCookieName(address: string): string {
  return `${KEY_COOKIE_PREFIX}${encodeURIComponent(address)}`;
}

function getActiveWalletAddressFromCookie(): string | null {
  const activeAddressRaw = readCookie(ACTIVE_WALLET_ADDRESS_COOKIE);
  if (!activeAddressRaw) {
    return null;
  }

  try {
    return decodeURIComponent(activeAddressRaw);
  } catch {
    return null;
  }
}

function readCookie(name: string): string | null {
  const target = `${name}=`;
  const parts = document.cookie.split(";");

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(target)) {
      return trimmed.slice(target.length);
    }
  }

  return null;
}

function setCookie(name: string, value: string): void {
  const secureAttr = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value}; Path=/; Max-Age=${KEY_COOKIE_MAX_AGE_SECONDS}; SameSite=Strict${secureAttr}`;
}

function deleteCookie(name: string): void {
  const secureAttr = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Strict${secureAttr}`;
}

function listCookieNames(): string[] {
  if (!document.cookie) {
    return [];
  }

  return document.cookie
    .split(";")
    .map((part) => part.trim().split("=")[0])
    .filter((name) => name.length > 0);
}

function parseTxid(raw: string): string {
  const normalized = normalizeStringPayload(raw);

  try {
    const parsed = JSON.parse(normalized) as unknown;

    if (typeof parsed === "string") {
      const txid = normalizeStringPayload(parsed);
      if (txid.length > 0) {
        return txid;
      }
    }

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "txid" in parsed &&
      typeof (parsed as { txid?: unknown }).txid === "string"
    ) {
      return normalizeStringPayload((parsed as { txid: string }).txid);
    }
  } catch {
    // Keep fallback behavior for plain text txid responses.
  }

  if (normalized.length === 0) {
    throw new WalletKeyFetchError("No txid returned from HyperBEAM");
  }

  return normalized;
}

async function fetchTextOrThrow(url: string): Promise<string> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new WalletKeyFetchError(
      `Failed to fetch wallet key resource: ${response.status}`,
      response.status,
    );
  }

  return response.text();
}

export function getCachedWalletKey(address: string): string | null {
  const normalizedAddress = normalizeAddress(address);
  if (!normalizedAddress) {
    return null;
  }

  try {
    const rawCookieValue = readCookie(makeCookieName(normalizedAddress));
    if (!rawCookieValue) {
      return null;
    }

    return decodeURIComponent(rawCookieValue);
  } catch {
    return null;
  }
}

export function hasWalletKeyCookie(address: string): boolean {
  const normalizedAddress = normalizeAddress(address);
  if (!normalizedAddress) {
    return false;
  }

  return readCookie(makeCookieName(normalizedAddress)) !== null;
}

export function isWalletCookieContextMatching(address: string): boolean {
  const normalizedAddress = normalizeAddress(address);
  if (!normalizedAddress) {
    return false;
  }

  const activeAddress = getActiveWalletAddressFromCookie();
  return activeAddress === normalizedAddress;
}

export function hasMatchingCachedWalletKey(address: string): boolean {
  const normalizedAddress = normalizeAddress(address);
  if (!normalizedAddress) {
    return false;
  }

  return (
    isWalletCookieContextMatching(normalizedAddress) &&
    hasWalletKeyCookie(normalizedAddress)
  );
}

export function clearWalletKeyCookies(): void {
  const cookieNames = listCookieNames();

  for (const name of cookieNames) {
    if (
      name === ACTIVE_WALLET_ADDRESS_COOKIE ||
      name.startsWith(KEY_COOKIE_PREFIX)
    ) {
      deleteCookie(name);
    }
  }
}

export function syncWalletKeyCookiesForAddress(address: string): void {
  const normalizedAddress = normalizeAddress(address);
  if (!normalizedAddress) {
    return;
  }

  const activeAddress = getActiveWalletAddressFromCookie();

  if (activeAddress && activeAddress !== normalizedAddress) {
    clearWalletKeyCookies();
  }

  setCookie(
    ACTIVE_WALLET_ADDRESS_COOKIE,
    encodeURIComponent(normalizedAddress),
  );
}

export function setCachedWalletKey(address: string, key: string): void {
  const normalizedAddress = normalizeAddress(address);
  if (!normalizedAddress || !key) {
    return;
  }

  const encodedValue = encodeURIComponent(key);
  const entry: KeyCache = { [normalizedAddress]: key };

  // Browsers usually cap each cookie around 4KB. If too large, skip persistence.
  if (encodedValue.length > 3500) {
    console.warn(
      "Wallet key is too large to store in cookies; using memory only",
      {
        address: normalizedAddress,
        size: encodedValue.length,
        sample: Object.keys(entry).length,
      },
    );
    return;
  }

  syncWalletKeyCookiesForAddress(normalizedAddress);
  setCookie(makeCookieName(normalizedAddress), encodedValue);
}

export async function fetchAndDecryptWalletKey(
  address: string,
): Promise<string> {
  const normalizedAddress = normalizeAddress(address);
  if (!normalizedAddress) {
    throw new WalletKeyFetchError("Wallet address is required");
  }

  const hbBase = HYPERBEAM.replace(/\/+$/, "");
  const txidUrl = `${hbBase}/${processId}~process@1.0/now/user/${encodeURIComponent(normalizedAddress)}/txid`;

  const txidResponse = await fetchTextOrThrow(txidUrl);
  const txid = parseTxid(txidResponse);

  const encryptedPayload = normalizeStringPayload(
    await fetchTextOrThrow(`https://arweave.net/${encodeURIComponent(txid)}`),
  );

  return decrypt(encryptedPayload);
}

export async function fetchAndCacheWalletKey(address: string): Promise<string> {
  const key = await fetchAndDecryptWalletKey(address);
  setCachedWalletKey(address, key);
  return key;
}
