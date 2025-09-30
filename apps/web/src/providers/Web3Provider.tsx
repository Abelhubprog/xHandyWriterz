import React from 'react';

type Props = { children: React.ReactNode };

// Minimal placeholder provider. We can wire wagmi/viem later if needed.
export default function Web3Provider({ children }: Props) {
  return <>{children}</>;
}
