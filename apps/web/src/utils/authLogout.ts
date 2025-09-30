/**
 * Centralized logout helper used by dashboard shells.
 * Wraps Clerk's signOut and performs a safe redirect.
 */
export async function performLogout(
  signOut: () => Promise<void>,
  opts: { redirectTo?: string } = {}
): Promise<void> {
  const redirect = opts.redirectTo || '/';
  try {
    await signOut();
  } catch (err) {
    // Non-fatal: continue to redirect even if signOut throws
    console.error('performLogout: signOut failed:', err);
  } finally {
    try {
      // Use hard navigation to clear app state and caches
      window.location.assign(redirect);
    } catch {
      window.location.href = redirect;
    }
  }
}

export default performLogout;

