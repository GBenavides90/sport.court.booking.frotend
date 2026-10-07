import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Container, Box,
  useScrollTrigger, Slide, Divider
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../context/AuthContext';

/* ── TC-04: Header sticky (always visible on scroll) ── */
export default function Header() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
            {user && user.role === 'ADMIN' && (
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
            )}

            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.15)', mx: 0.5 }} />

            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                  <AccountCircleIcon />
                  <Typography variant="body2" fontWeight="600">{user.email}</Typography>
                </Box>
                <Button
                  id="btn-logout"
                  variant="outlined"
                  onClick={handleLogout}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.35)',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.07)',
                    },
                    borderRadius: 2,
                    px: 2,
                  }}
                >
                  Cerrar Sesión
                </Button>
              </Box>
            ) : (
              <>
                <Button
                  id="btn-iniciar-sesion"
                  component={Link}
                  to="/login"
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

                <Button
                  id="btn-crear-cuenta"
                  component={Link}
                  to="/registro"
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
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
