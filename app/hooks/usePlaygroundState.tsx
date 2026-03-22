/**
 * Playground state management using React Context and useReducer
 */
import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { ClientConfig, OIDCProviderMetadata } from "../lib/storage/client-config";

export type FlowType = "authorization_code" | "client_credentials" | "refresh_token" | null;

export interface PKCEState {
  verifier: string;
  challenge: string;
  method: "S256" | "plain";
}

export interface AuthorizationRequestData {
  // Required parameters
  scope: string;
  response_type: string;
  state: string;

  // OIDC parameters
  nonce?: string;

  // PKCE parameters (auto-generated)
  code_challenge?: string;
  code_challenge_method?: "S256" | "plain";

  // Optional parameters
  response_mode?: "query" | "fragment" | "form_post" | string;
  display?: "page" | "popup" | "touch" | "wap";
  prompt?: string;
  max_age?: number;
  ui_locales?: string;
  id_token_hint?: string;
  login_hint?: string;
  acr_values?: string;
  resource?: string;

  // Custom parameters
  customParams?: Record<string, string>;
}

export interface AuthorizationCallbackData {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

export interface TokenResponseData {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
}

export interface TokenErrorData {
  error: string;
  error_description?: string;
  error_uri?: string;
}

export interface PlaygroundState {
  selectedFlow: FlowType;
  selectedClient: ClientConfig | null;
  providerMetadata: OIDCProviderMetadata | null;
  currentStep: number;
  pkce: PKCEState | null;
  authRequest: AuthorizationRequestData | null;
  authCallback: AuthorizationCallbackData | null;
  tokenResponse: TokenResponseData | null;
  tokenError: TokenErrorData | null;
  error: string | null;
  loading: boolean;
}

export type PlaygroundAction =
  | { type: "SELECT_FLOW"; payload: FlowType }
  | { type: "SELECT_CLIENT"; payload: ClientConfig }
  | { type: "SET_PROVIDER_METADATA"; payload: OIDCProviderMetadata }
  | { type: "SET_PKCE"; payload: PKCEState }
  | { type: "SET_AUTH_REQUEST"; payload: AuthorizationRequestData }
  | { type: "SET_AUTH_CALLBACK"; payload: AuthorizationCallbackData }
  | { type: "SET_TOKEN_RESPONSE"; payload: TokenResponseData }
  | { type: "SET_TOKEN_ERROR"; payload: TokenErrorData }
  | { type: "ADVANCE_STEP" }
  | { type: "GO_TO_STEP"; payload: number }
  | { type: "RESET_FLOW" }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: PlaygroundState = {
  selectedFlow: null,
  selectedClient: null,
  providerMetadata: null,
  currentStep: 0,
  pkce: null,
  authRequest: null,
  authCallback: null,
  tokenResponse: null,
  tokenError: null,
  error: null,
  loading: false,
};

function playgroundReducer(state: PlaygroundState, action: PlaygroundAction): PlaygroundState {
  switch (action.type) {
    case "SELECT_FLOW":
      return {
        ...initialState,
        selectedFlow: action.payload,
        currentStep: action.payload ? 0 : 0,
      };

    case "SELECT_CLIENT":
      return {
        ...state,
        selectedClient: action.payload,
        providerMetadata: action.payload.metadata || null,
      };

    case "SET_PROVIDER_METADATA":
      return {
        ...state,
        providerMetadata: action.payload,
      };

    case "SET_PKCE":
      return {
        ...state,
        pkce: action.payload,
      };

    case "SET_AUTH_REQUEST":
      return {
        ...state,
        authRequest: action.payload,
      };

    case "SET_AUTH_CALLBACK":
      return {
        ...state,
        authCallback: action.payload,
      };

    case "SET_TOKEN_RESPONSE":
      return {
        ...state,
        tokenResponse: action.payload,
        tokenError: null,
        error: null,
      };

    case "SET_TOKEN_ERROR":
      return {
        ...state,
        tokenError: action.payload,
        tokenResponse: null,
      };

    case "ADVANCE_STEP":
      return {
        ...state,
        currentStep: state.currentStep + 1,
      };

    case "GO_TO_STEP":
      return {
        ...state,
        currentStep: action.payload,
      };

    case "RESET_FLOW":
      return {
        ...initialState,
        selectedFlow: state.selectedFlow,
        currentStep: state.selectedFlow ? 1 : 0,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };

    default:
      return state;
  }
}

interface PlaygroundContextValue {
  state: PlaygroundState;
  dispatch: React.Dispatch<PlaygroundAction>;
}

const PlaygroundContext = createContext<PlaygroundContextValue | null>(null);

export function PlaygroundProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playgroundReducer, initialState);

  return (
    <PlaygroundContext.Provider value={{ state, dispatch }}>
      {children}
    </PlaygroundContext.Provider>
  );
}

export function usePlayground() {
  const context = useContext(PlaygroundContext);
  if (!context) {
    throw new Error("usePlayground must be used within PlaygroundProvider");
  }
  return context;
}
