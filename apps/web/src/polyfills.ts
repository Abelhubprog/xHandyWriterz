// Disable MetaMask detection and warnings
if (typeof window !== 'undefined') {
  // Check if we should disable MetaMask detection based on environment variable
  // Access env vars more safely with type assertions and existence checks
  const metaMaskDetection = import.meta.env ? String(import.meta.env.VITE_DISABLE_METAMASK_DETECTION || '') : '';
  const disableMetaMask = metaMaskDetection === 'true' || import.meta.env.DEV;

  if (disableMetaMask) {
    // Set flag to disable MetaMask detection
  (window as any).__disableMetamaskDetection = true;

    // Override console.error to filter MetaMask warnings
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      // Filter out MetaMask-related errors
      const isMetaMaskError = args.some(arg =>
        typeof arg === 'string' && (
          arg.includes('MetaMask') ||
          arg.includes('ethereum') ||
          arg.includes('web3modal') ||
          arg.includes('wallet')
        )
      );

      if (!isMetaMaskError) {
        originalConsoleError(...args);
      }
    };

    // Do NOT assign to window.ethereum to avoid provider conflicts with wallet extensions
  }
}

// Global process polyfill
if (typeof window !== 'undefined') {
  // Ensure process exists
  if (!(window as any).process) {
    (window as any).process = {} as NodeJS.Process;
  }

  // Ensure process.env exists
  if (!(window as any).process.env) {
    (window as any).process.env = {
      NODE_ENV: import.meta.env.MODE,
      VITE_DYNAMIC_ENVIRONMENT_ID: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID
    };
  }

  // Copy all VITE_ prefixed env variables
  Object.keys(import.meta.env).forEach(key => {
    if (key.startsWith('VITE_')) {
      (window as any).process.env[key] = (import.meta as any).env[key];
    }
  });
}

// Add globalThis polyfill
if (typeof window !== 'undefined' && !(window as any).global) {
  (window as any).global = window as any;
}

export {};
