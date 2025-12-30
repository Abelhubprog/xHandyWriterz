import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';

interface AuthPromptState {
  isOpen: boolean;
  message: string;
  redirectPath?: string;
}

interface UseAuthPromptReturn {
  /** Whether the auth prompt is currently shown */
  isPromptOpen: boolean;
  /** The message to display in the prompt */
  promptMessage: string;
  /** Path to redirect to after authentication */
  redirectPath?: string;
  /** Show the authentication prompt */
  showAuthPrompt: (message?: string, redirectPath?: string) => void;
  /** Hide the authentication prompt */
  hideAuthPrompt: () => void;
  /** Check if user is authenticated, show prompt if not */
  requireAuth: (message?: string, redirectPath?: string) => boolean;
}

const DEFAULT_MESSAGE = 'Please sign in to continue';

/**
 * Hook for managing authentication prompts.
 * Provides utilities to show login prompts and check auth status.
 */
export function useAuthPrompt(): UseAuthPromptReturn {
  const { isSignedIn } = useAuth();
  
  const [state, setState] = useState<AuthPromptState>({
    isOpen: false,
    message: DEFAULT_MESSAGE,
    redirectPath: undefined,
  });

  const showAuthPrompt = useCallback((
    message: string = DEFAULT_MESSAGE,
    redirectPath?: string
  ) => {
    setState({
      isOpen: true,
      message,
      redirectPath,
    });
  }, []);

  const hideAuthPrompt = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  /**
   * Check if user is authenticated.
   * If not, show the auth prompt and return false.
   * If authenticated, return true.
   */
  const requireAuth = useCallback((
    message?: string,
    redirectPath?: string
  ): boolean => {
    if (isSignedIn) {
      return true;
    }
    
    showAuthPrompt(message, redirectPath);
    return false;
  }, [isSignedIn, showAuthPrompt]);

  return {
    isPromptOpen: state.isOpen,
    promptMessage: state.message,
    redirectPath: state.redirectPath,
    showAuthPrompt,
    hideAuthPrompt,
    requireAuth,
  };
}

export default useAuthPrompt;
