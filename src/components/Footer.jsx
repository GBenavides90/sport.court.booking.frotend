import React from 'react';
import { Box, Typography, Container } from '@mui/material';

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'primary.main', color: 'white', py: 3, mt: 'auto' }}>
      <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          SPORT COURT <span style={{ color: '#2FBF71' }}>BOOKING</span>
        </Typography>
        <Typography variant="body2" color="inherit">
          &copy; {new Date().getFullYear()} Sport Court Booking. Todos los derechos reservados.
        </Typography>
      </Container>
    </Box>
  );
}
