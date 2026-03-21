import { useState, useEffect, useCallback } from "react";
import type { Issuer, OpenIDConfiguration } from "../lib/oauth/types";
import {
  getIssuers,
  addIssuer as addIssuerToStorage,
  updateIssuer as updateIssuerInStorage,
  deleteIssuer as deleteIssuerFromStorage,
  createIssuer,
} from "../lib/storage/issuers";

interface UseIssuersReturn {
  issuers: Issuer[];
  isLoading: boolean;
  addIssuer: (name: string, issuerUrl: string, wellKnown: OpenIDConfiguration) => Issuer;
  updateIssuer: (id: string, updates: Partial<Omit<Issuer, "id" | "createdAt">>) => void;
  deleteIssuer: (id: string) => void;
  refreshIssuer: (id: string, wellKnown: OpenIDConfiguration) => void;
  getIssuerById: (id: string) => Issuer | undefined;
}

export function useIssuers(): UseIssuersReturn {
  const [issuers, setIssuers] = useState<Issuer[]>(() => {
    if (typeof window === "undefined") return [];
    return getIssuers();
  });
  const [isLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIssuers(getIssuers());
  }, []);

  const addIssuer = useCallback(
    (name: string, issuerUrl: string, wellKnown: OpenIDConfiguration): Issuer => {
      const newIssuer = createIssuer(name, issuerUrl, wellKnown);
      const updatedIssuers = addIssuerToStorage(newIssuer);
      setIssuers(updatedIssuers);
      return newIssuer;
    },
    [],
  );

  const updateIssuer = useCallback(
    (id: string, updates: Partial<Omit<Issuer, "id" | "createdAt">>) => {
      const updatedIssuers = updateIssuerInStorage(id, updates);
      setIssuers(updatedIssuers);
    },
    [],
  );

  const deleteIssuer = useCallback((id: string) => {
    const updatedIssuers = deleteIssuerFromStorage(id);
    setIssuers(updatedIssuers);
  }, []);

  const refreshIssuer = useCallback((id: string, wellKnown: OpenIDConfiguration) => {
    const updatedIssuers = updateIssuerInStorage(id, { wellKnown });
    setIssuers(updatedIssuers);
  }, []);

  const getIssuerById = useCallback(
    (id: string): Issuer | undefined => {
      return issuers.find((i) => i.id === id);
    },
    [issuers],
  );

  return {
    issuers,
    isLoading,
    addIssuer,
    updateIssuer,
    deleteIssuer,
    refreshIssuer,
    getIssuerById,
  };
}
