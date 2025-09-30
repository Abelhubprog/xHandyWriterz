import { Box, CircularProgress, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { TRANSITION_DURATION } from '@/theme/transitions';

interface ThemeTransitionProps {
  children: React.ReactNode;
}

export default function ThemeTransition({ children }: ThemeTransitionProps) {
  const theme = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [content, setContent] = useState(children);

  useEffect(() => {
    // When children change (theme switch), show loading state
    setIsTransitioning(true);

    // After a brief delay, update content and hide loading
    const timer = setTimeout(() => {
      setContent(children);
      setIsTransitioning(false);
    }, TRANSITION_DURATION / 2);

    return () => clearTimeout(timer);
  }, [children]);

  if (isTransitioning) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: theme.palette.background.default,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: theme.zIndex.modal + 1,
          opacity: isTransitioning ? 1 : 0,
          transition: `opacity ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        opacity: isTransitioning ? 0 : 1,
        transition: `opacity ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
    >
      {content}
    </Box>
  );
}
