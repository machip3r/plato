import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { createContext, useContext, type PropsWithChildren } from 'react';

type PlatoAuth = {
  configured: boolean;
  loaded: boolean;
  signedIn: boolean;
  userId: string | null;
  getAccessToken: () => Promise<string | null>;
};

const unavailableAuth: PlatoAuth = {
  configured: false,
  loaded: true,
  signedIn: false,
  userId: null,
  getAccessToken: async () => null,
};

const AuthContext = createContext<PlatoAuth>(unavailableAuth);
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();

export function PlatoAuthProvider({ children }: PropsWithChildren) {
  if (!publishableKey) {
    return <AuthContext.Provider value={unavailableAuth}>{children}</AuthContext.Provider>;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkAuthBridge>{children}</ClerkAuthBridge>
    </ClerkProvider>
  );
}

function ClerkAuthBridge({ children }: PropsWithChildren) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();

  const auth: PlatoAuth = {
    configured: true,
    loaded: isLoaded,
    signedIn: Boolean(isSignedIn),
    userId: userId ?? null,
    getAccessToken: () => getToken(),
  };

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

/** Exposes only the verified-session token needed by the future PLATO API client. */
export function usePlatoAuth() {
  return useContext(AuthContext);
}
