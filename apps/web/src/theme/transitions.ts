/**
 * Transition configuration constants for consistent animations
 */

// Duration presets (in milliseconds)
export const durations = {
  instant: 0,
  fastest: 50,
  faster: 100,
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 400,
  slowest: 500,
} as const;

// Easing presets
export const easings = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  // Material Design easings
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  // Spring-like
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

// Pre-built transition strings
export const transitions = {
  // Opacity transitions
  fadeIn: `opacity ${durations.normal}ms ${easings.easeOut}`,
  fadeOut: `opacity ${durations.normal}ms ${easings.easeIn}`,
  
  // Transform transitions
  scaleIn: `transform ${durations.normal}ms ${easings.easeOut}`,
  scaleOut: `transform ${durations.fast}ms ${easings.easeIn}`,
  
  // Slide transitions
  slideIn: `transform ${durations.normal}ms ${easings.decelerate}`,
  slideOut: `transform ${durations.fast}ms ${easings.accelerate}`,
  
  // Combined transitions
  all: `all ${durations.normal}ms ${easings.standard}`,
  allFast: `all ${durations.fast}ms ${easings.standard}`,
  allSlow: `all ${durations.slow}ms ${easings.standard}`,
  
  // Specific property transitions
  colors: `color ${durations.fast}ms ${easings.standard}, background-color ${durations.fast}ms ${easings.standard}, border-color ${durations.fast}ms ${easings.standard}`,
  shadow: `box-shadow ${durations.normal}ms ${easings.standard}`,
  transform: `transform ${durations.normal}ms ${easings.standard}`,
  opacity: `opacity ${durations.normal}ms ${easings.standard}`,
} as const;

// Tailwind-compatible transition class helpers
export const transitionClasses = {
  base: 'transition-all duration-200 ease-in-out',
  fast: 'transition-all duration-150 ease-in-out',
  slow: 'transition-all duration-300 ease-in-out',
  colors: 'transition-colors duration-150 ease-in-out',
  opacity: 'transition-opacity duration-200 ease-in-out',
  transform: 'transition-transform duration-200 ease-in-out',
  none: 'transition-none',
} as const;

// Animation keyframes for CSS-in-JS
export const keyframes = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  scaleIn: {
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },
  slideInUp: {
    from: { transform: 'translateY(10px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  slideInDown: {
    from: { transform: 'translateY(-10px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  pulse: {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 },
  },
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
} as const;

export default transitions;
