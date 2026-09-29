import React from 'react';
import { Box, Typography, Container, Grid, Divider, IconButton } from '@mui/material';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';

/* ── HU7: Footer visible en todas las páginas — TC-20 / TC-21 ── */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    /* TC-20: Footer visible en todas las páginas */
    <Box
      id="main-footer"
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        pt: 5,
        pb: 3,
        mt: 'auto',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4} sx={{ mb: 4 }}>

          {/* Brand column */}
          <Grid item xs={12} md={4}>
            {/* TC-21: Logo visible */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  bgcolor: 'success.main',
                  borderRadius: '50%',
                  width: 40, height: 40,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 0 3px rgba(47,191,113,0.25)',
                }}
              >
                <SportsTennisIcon sx={{ color: 'white', fontSize: 22 }} />
              </Box>
              <Typography
                id="footer-logo"
                variant="h6"
                sx={{ fontWeight: 800, letterSpacing: '0.04em', color: 'white' }}
              >
                SPORT COURT{' '}
                <Typography component="span" variant="h6" sx={{ color: 'success.main', fontWeight: 800 }}>
                  BOOKING
                </Typography>
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 300 }}>
              La plataforma digital que centraliza la reserva de canchas deportivas.
              Fácil, rápido y organizado.
            </Typography>

            {/* Social links */}
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              {[
                { icon: <FacebookIcon />, label: 'Facebook' },
                { icon: <InstagramIcon />, label: 'Instagram' },
                { icon: <TwitterIcon />, label: 'Twitter' },
              ].map(({ icon, label }) => (
                <IconButton
                  key={label}
                  aria-label={label}
                  size="small"
                  sx={{
                    color: 'rgba(255,255,255,0.6)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    '&:hover': { color: 'success.main', borderColor: 'success.main', bgcolor: 'rgba(47,191,113,0.08)' },
                    transition: 'all 0.2s',
                  }}
                >
                  {icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Disciplines */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'success.main', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem' }}>
              Deportes
            </Typography>
            {['Fútbol', 'Tenis', 'Pádel', 'Squash', 'Básquet'].map(sport => (
              <Typography key={sport} variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 0.8, cursor: 'pointer', '&:hover': { color: 'white' }, transition: 'color 0.15s' }}>
                {sport}
              </Typography>
            ))}
          </Grid>

          {/* Links */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'success.main', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem' }}>
              Plataforma
            </Typography>
            {['Inicio', 'Canchas', 'Reservas', 'Administración'].map(link => (
              <Typography key={link} variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 0.8, cursor: 'pointer', '&:hover': { color: 'white' }, transition: 'color 0.15s' }}>
                {link}
              </Typography>
            ))}
          </Grid>

          {/* Contact */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'success.main', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem' }}>
              Contacto
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1 }}>
              📧 contacto@sportcourtbooking.com
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1 }}>
              📞 +1 (555) 123-4567
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              🕒 Lunes a Domingo: 6:00 AM – 10:00 PM
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

        {/* TC-21: Copyright */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography
            id="footer-copyright"
            variant="body2"
            sx={{ color: 'rgba(255,255,255,0.5)' }}
          >
            © {currentYear} Sport Court Booking. Todos los derechos reservados.
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>
            Desarrollado por Giuseppe David Benavides Jiménez
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
