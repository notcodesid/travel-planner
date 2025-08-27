import { useCallback } from 'react';
import { signIn, signOut } from '@auth/create/react';

interface AuthOptions {
  callbackUrl?: string;
  [key: string]: unknown;
}

function useAuth() {
  const callbackUrl =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('callbackUrl')
      : null;

  const signInWithCredentials = useCallback(
    (options: AuthOptions) => {
      return signIn('credentials-signin', {
        ...options,
        callbackUrl: callbackUrl ?? options.callbackUrl,
      });
    },
    [callbackUrl],
  );

  const signUpWithCredentials = useCallback(
    (options: AuthOptions) => {
      return signIn('credentials-signup', {
        ...options,
        callbackUrl: callbackUrl ?? options.callbackUrl,
      });
    },
    [callbackUrl],
  );

  const signInWithGoogle = useCallback(
    (options?: AuthOptions) => {
      return signIn('google', {
        ...options,
        callbackUrl: callbackUrl ?? options?.callbackUrl,
      });
    },
    [callbackUrl],
  );

  const signInWithFacebook = useCallback(
    (options?: AuthOptions) => {
      return signIn('facebook', options);
    },
    [],
  );

  const signInWithTwitter = useCallback(
    (options?: AuthOptions) => {
      return signIn('twitter', options);
    },
    [],
  );

  return {
    signInWithCredentials,
    signUpWithCredentials,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signOut,
  };
}

export default useAuth;
