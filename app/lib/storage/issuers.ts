import type { Issuer, OpenIDConfiguration } from "../oauth/types";

const STORAGE_KEY = "oauth-playground-issuers";

export function generateId(): string {
  return crypto.randomUUID();
}

export function getIssuers(): Issuer[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveIssuers(issuers: Issuer[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(issuers));
}

export function createIssuer(
  name: string,
  issuerUrl: string,
  wellKnown: OpenIDConfiguration,
): Issuer {
  const now = Date.now();
  return {
    id: generateId(),
    name,
    issuer: issuerUrl,
    wellKnown,
    createdAt: now,
    updatedAt: now,
  };
}

export function addIssuer(issuer: Issuer): Issuer[] {
  const issuers = getIssuers();
  issuers.push(issuer);
  saveIssuers(issuers);
  return issuers;
}

export function updateIssuer(
  id: string,
  updates: Partial<Omit<Issuer, "id" | "createdAt">>,
): Issuer[] {
  const issuers = getIssuers();
  const index = issuers.findIndex((i) => i.id === id);
  if (index !== -1) {
    issuers[index] = {
      ...issuers[index],
      ...updates,
      updatedAt: Date.now(),
    };
    saveIssuers(issuers);
  }
  return issuers;
}

export function deleteIssuer(id: string): Issuer[] {
  const issuers = getIssuers().filter((i) => i.id !== id);
  saveIssuers(issuers);
  return issuers;
}

export function getIssuerById(id: string): Issuer | undefined {
  return getIssuers().find((i) => i.id === id);
}
