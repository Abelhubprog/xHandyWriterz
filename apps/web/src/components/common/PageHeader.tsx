import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { styled } from '@mui/material/styles';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  imagePath?: string;
}

const HeaderContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  backgroundColor: theme.palette.primary.main,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: theme.palette.common.white,
  padding: theme.spacing(8, 0),
  marginBottom: theme.spacing(4),
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