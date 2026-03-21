import { useState, useEffect, useCallback } from "react";
import type { OAuthClient } from "../lib/oauth/types";
import {
  getClients,
  addClient as addClientToStorage,
  updateClient as updateClientInStorage,
  deleteClient as deleteClientFromStorage,
  createClient,
} from "../lib/storage/clients";

interface UseClientsReturn {
  clients: OAuthClient[];
  isLoading: boolean;
  addClient: (
    name: string,
    issuerId: string,
    clientId: string,
    clientSecret?: string,
  ) => OAuthClient;
  updateClient: (id: string, updates: Partial<Omit<OAuthClient, "id">>) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => OAuthClient | undefined;
  getClientsByIssuerId: (issuerId: string) => OAuthClient[];
}

export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<OAuthClient[]>(() => {
    if (typeof window === "undefined") return [];
    return getClients();
  });
  const [isLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setClients(getClients());
  }, []);

  const addClient = useCallback(
    (name: string, issuerId: string, clientId: string, clientSecret?: string): OAuthClient => {
      const newClient = createClient(name, issuerId, clientId, clientSecret);
      const updatedClients = addClientToStorage(newClient);
      setClients(updatedClients);
      return newClient;
    },
    [],
  );

  const updateClient = useCallback((id: string, updates: Partial<Omit<OAuthClient, "id">>) => {
    const updatedClients = updateClientInStorage(id, updates);
    setClients(updatedClients);
  }, []);

  const deleteClient = useCallback((id: string) => {
    const updatedClients = deleteClientFromStorage(id);
    setClients(updatedClients);
  }, []);

  const getClientById = useCallback(
    (id: string): OAuthClient | undefined => {
      return clients.find((c) => c.id === id);
    },
    [clients],
  );

  const getClientsByIssuerId = useCallback(
    (issuerId: string): OAuthClient[] => {
      return clients.filter((c) => c.issuerId === issuerId);
    },
    [clients],
  );

  return {
    clients,
    isLoading,
    addClient,
    updateClient,
    deleteClient,
    getClientById,
    getClientsByIssuerId,
  };
}
