import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { styled } from '@mui/system';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  imagePath?: string;
}

const HeaderContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  backgroundColor: (theme as any).palette?.primary?.main || '#1976d2',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: (theme as any).palette?.common?.white || '#fff',
  padding: (theme as any).spacing?.(8, 0) || '64px 0',
  marginBottom: (theme as any).spacing?.(4) || '32px',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
}));

const ContentContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  textAlign: 'center',
}));

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, imagePath }) => {
  return (
    <HeaderContainer
      sx={{
        backgroundImage: imagePath ? `url(${imagePath})` : 'none',
      }}
    >
      <ContentContainer maxWidth="lg">
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="h5"
            sx={{
              maxWidth: '800px',
              margin: '0 auto',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            {subtitle}
          </Typography>
        )}
      </ContentContainer>
    </HeaderContainer>
  );
};

export default PageHeader; 