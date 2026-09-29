import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Container, Box,
  useScrollTrigger, Slide, Divider
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';

/* ── TC-04: Header sticky (always visible on scroll) ── */
export default function Header() {
  const navigate  = useNavigate();
  const location  = useLocation();

  return (
    /* TC-01: Header visible in all pages */
    <AppBar
      id="main-header"
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'primary.main',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ height: 64 }}>

          {/* ── Logo → home (TC-02) ── */}
          <Box
            id="header-logo"
            onClick={() => navigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              flexGrow: 1,
              textDecoration: 'none',
              '&:hover .logo-text': { opacity: 0.85 },
              transition: 'opacity 0.2s',
            }}
          >
            <Box
              sx={{
                bgcolor: 'success.main',
                borderRadius: '50%',
                width: 38, height: 38,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 0 0 3px rgba(47,191,113,0.25)',
              }}
            >
              <SportsTennisIcon sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box className="logo-text">
              <Typography
                variant="h6"
                component="span"
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  color: 'white',
                  lineHeight: 1,
                }}
              >
                SPORT COURT{' '}
                <Typography
                  component="span"
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: 'success.main',
                    letterSpacing: '0.04em',
                  }}
                >
                  BOOKING
                </Typography>
              </Typography>
            </Box>
          </Box>

          {/* ── Nav links ── */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              component={Link}
              to="/administracion"
              sx={{
                color: location.pathname === '/administracion'
                  ? 'success.main'
                  : 'rgba(255,255,255,0.75)',
                fontWeight: 600,
                fontSize: '0.875rem',
                '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.07)' },
              }}
            >
              Administración
            </Button>

            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.15)', mx: 0.5 }} />

            {/* TC-03: "Iniciar sesión" button visible */}
            <Button
              id="btn-iniciar-sesion"
              variant="outlined"
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.35)',
                fontWeight: 600,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.07)',
                },
                borderRadius: 2,
                px: 2.5,
              }}
            >
              Iniciar Sesión
            </Button>

            {/* TC-03: "Crear cuenta" button visible */}
            <Button
              id="btn-crear-cuenta"
              variant="contained"
              color="success"
              sx={{
                fontWeight: 700,
                borderRadius: 2,
                px: 2.5,
                '&:hover': { bgcolor: '#27a660' },
                boxShadow: '0 2px 8px rgba(47,191,113,0.4)',
              }}
            >
              Crear Cuenta
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
