export function logEnvironmentStatus() {
  if (import.meta.env.DEV) {
    // Keep it minimal to avoid noisy console
    // Confirms Vite env is wired and proxy will work
    console.info('[env] dev mode:', import.meta.env.MODE);
  }
}
