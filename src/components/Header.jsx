import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import SportsIcon from '@mui/icons-material/Sports';

export default function Header() {
  const navigate = useNavigate();

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'primary.main', boxShadow: 3 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexGrow: 1 }}
            onClick={() => navigate('/')}
          >
            <SportsIcon sx={{ color: 'success.main', mr: 1, fontSize: 32 }} />
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.1rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              SPORT COURT <span style={{ color: '#2FBF71' }}>BOOKING</span>
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 0, display: 'flex', gap: 2 }}>
            <Button color="inherit" component={Link} to="/administracion">
              Admin
            </Button>
            <Button variant="outlined" color="inherit" sx={{ borderColor: 'white' }}>
              Iniciar Sesión
            </Button>
            <Button variant="contained" color="success" sx={{ color: 'white' }}>
              Crear Cuenta
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
