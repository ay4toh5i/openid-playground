import type { OAuthClient } from "../oauth/types";
import { generateId } from "./issuers";

const STORAGE_KEY = "oauth-playground-clients";

export function getClients(): OAuthClient[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveClients(clients: OAuthClient[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

export function createClient(
  name: string,
  issuerId: string,
  clientId: string,
  clientSecret?: string,
): OAuthClient {
  return {
    id: generateId(),
    name,
    issuerId,
    clientId,
    clientSecret,
  };
}

export function addClient(client: OAuthClient): OAuthClient[] {
  const clients = getClients();
  clients.push(client);
  saveClients(clients);
  return clients;
}

export function updateClient(id: string, updates: Partial<Omit<OAuthClient, "id">>): OAuthClient[] {
  const clients = getClients();
  const index = clients.findIndex((c) => c.id === id);
  if (index !== -1) {
    clients[index] = {
      ...clients[index],
      ...updates,
    };
    saveClients(clients);
  }
  return clients;
}

export function deleteClient(id: string): OAuthClient[] {
  const clients = getClients().filter((c) => c.id !== id);
  saveClients(clients);
  return clients;
}

export function getClientById(id: string): OAuthClient | undefined {
  return getClients().find((c) => c.id === id);
}

export function getClientsByIssuerId(issuerId: string): OAuthClient[] {
  return getClients().filter((c) => c.issuerId === issuerId);
}

export function deleteClientsByIssuerId(issuerId: string): OAuthClient[] {
  const clients = getClients().filter((c) => c.issuerId !== issuerId);
  saveClients(clients);
  return clients;
}
