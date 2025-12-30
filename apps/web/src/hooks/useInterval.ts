import { useEffect, useRef, useCallback } from 'react';

/**
 * A hook that wraps setInterval in a declarative way.
 * The interval is automatically cleaned up on unmount.
 * 
 * @param callback - Function to call on each interval
 * @param delay - Interval delay in milliseconds. Pass null to pause.
 */
export function useInterval(
  callback: () => void,
  delay: number | null
): void {
  const savedCallback = useRef<() => void>(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delay === null) {
      return;
    }

    const tick = () => {
      savedCallback.current();
    };

    const id = setInterval(tick, delay);
    
    return () => clearInterval(id);
  }, [delay]);
}

/**
 * A hook that provides a controllable interval.
 * Returns functions to start, stop, and reset the interval.
 */
export function useControllableInterval(
  callback: () => void,
  delay: number
): {
  start: () => void;
  stop: () => void;
  isRunning: boolean;
} {
  const savedCallback = useRef<() => void>(callback);
  const intervalId = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRunning = useRef(false);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const stop = useCallback(() => {
    if (intervalId.current !== null) {
      clearInterval(intervalId.current);
      intervalId.current = null;
      isRunning.current = false;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    intervalId.current = setInterval(() => {
      savedCallback.current();
    }, delay);
    isRunning.current = true;
  }, [delay, stop]);

  // Clean up on unmount
  useEffect(() => {
    return () => stop();
  }, [stop]);

  return {
    start,
    stop,
    isRunning: isRunning.current,
  };
}

export default useInterval;
