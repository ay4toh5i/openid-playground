/**
 * Client configuration storage using LocalStorage
 */

// Re-export types from oidc.ts (we'll need to make them exportable)
export interface ClientConfig {
  id: string;
  name: string;
  issuer: string;
  clientId: string;
  clientAuthenticationMethod:
    | "none"
    | "client_secret_basic"
    | "client_secret_post"
    | "private_key_jwt";
  clientSecret?: string;
  privateKey?: string;
  metadata?: OIDCProviderMetadata;
  createdAt: string;
  updatedAt: string;
}

// Simplified metadata type for storage
export interface OIDCProviderMetadata {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint?: string;
  userinfo_endpoint?: string;
  jwks_uri: string;
  scopes_supported?: string[];
  response_types_supported: string[];
  grant_types_supported?: string[];
  token_endpoint_auth_methods_supported?: string[];
}

const STORAGE_KEY = "oidc_playground_clients";

/**
 * Client configuration storage operations
 */
export class ClientConfigStorage {
  /**
   * Get all saved client configurations
   */
  static getAll(): ClientConfig[] {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [];
      }
      return JSON.parse(stored) as ClientConfig[];
    } catch (error) {
      console.error("Failed to retrieve client configurations:", error);
      return [];
    }
  }

  /**
   * Get a specific client configuration by ID
   */
  static getById(id: string): ClientConfig | null {
    const clients = this.getAll();
    return clients.find((client) => client.id === id) || null;
  }

  /**
   * Save a new client configuration or update existing one
   */
  static save(client: Omit<ClientConfig, "id" | "createdAt" | "updatedAt"> | ClientConfig): ClientConfig {
    if (typeof window === "undefined") {
      throw new Error("LocalStorage not available");
    }

    const clients = this.getAll();
    const now = new Date().toISOString();

    let savedClient: ClientConfig;

    if ("id" in client && client.id) {
      // Update existing client
      const index = clients.findIndex((c) => c.id === client.id);
      if (index !== -1) {
        savedClient = {
          ...client,
          updatedAt: now,
        };
        clients[index] = savedClient;
      } else {
        throw new Error(`Client with ID ${client.id} not found`);
      }
    } else {
      // Create new client
      savedClient = {
        ...client,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      clients.push(savedClient);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
      return savedClient;
    } catch (error) {
      console.error("Failed to save client configuration:", error);
      throw error;
    }
  }

  /**
   * Delete a client configuration
   */
  static delete(id: string): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      const clients = this.getAll();
      const filteredClients = clients.filter((client) => client.id !== id);

      if (filteredClients.length === clients.length) {
        return false; // Client not found
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredClients));
      return true;
    } catch (error) {
      console.error("Failed to delete client configuration:", error);
      return false;
    }
  }

  /**
   * Export all client configurations as JSON
   */
  static export(): string {
    const clients = this.getAll();
    return JSON.stringify(clients, null, 2);
  }

  /**
   * Import client configurations from JSON
   * @param json JSON string containing client configurations
   * @param mode 'merge' to keep existing configs, 'replace' to replace all
   */
  static import(json: string, mode: "merge" | "replace" = "merge"): number {
    if (typeof window === "undefined") {
      throw new Error("LocalStorage not available");
    }

    try {
      const importedClients = JSON.parse(json) as ClientConfig[];

      if (!Array.isArray(importedClients)) {
        throw new Error("Invalid import format: expected array of client configurations");
      }

      let existingClients = mode === "merge" ? this.getAll() : [];

      // Generate new IDs for imported clients to avoid conflicts
      const now = new Date().toISOString();
      const processedClients = importedClients.map((client) => ({
        ...client,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      }));

      const allClients = [...existingClients, ...processedClients];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(allClients));
      return processedClients.length;
    } catch (error) {
      console.error("Failed to import client configurations:", error);
      throw error;
    }
  }

  /**
   * Clear all client configurations
   */
  static clear(): void {
    if (typeof window === "undefined") {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear client configurations:", error);
    }
  }
}

/**
 * Fetch provider metadata from .well-known/openid-configuration
 */
export async function fetchProviderMetadata(issuer: string): Promise<OIDCProviderMetadata> {
  // Ensure issuer doesn't have trailing slash
  const normalizedIssuer = issuer.replace(/\/$/, "");
  const wellKnownUrl = `${normalizedIssuer}/.well-known/openid-configuration`;

  try {
    const response = await fetch(wellKnownUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch provider metadata: ${response.statusText}`);
    }

    const metadata = (await response.json()) as OIDCProviderMetadata;

    // Validate required fields
    if (!metadata.issuer || !metadata.authorization_endpoint || !metadata.jwks_uri) {
      throw new Error("Invalid provider metadata: missing required fields");
    }

    return metadata;
  } catch (error) {
    console.error("Failed to fetch provider metadata:", error);
    throw error;
  }
}
