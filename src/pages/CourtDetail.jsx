import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Button, Grid, Paper, Divider,
  Dialog, DialogContent, IconButton, Chip, Skeleton, Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon     from '@mui/icons-material/ArrowBack';
import CloseIcon         from '@mui/icons-material/Close';
import GroupIcon         from '@mui/icons-material/Group';
import SportsSoccerIcon  from '@mui/icons-material/SportsSoccer';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import api, { getImageUrl } from '../api/axiosConfig';
import FeatureIcon from '../components/FeatureIcon';

/* ── Helper: secondary image urls ── */
function getSecondaryImageUrl(court, index) {
  const colors = ['1E7F3B', '0A2540', '2FBF71', '6B7280'];
  return court.imageUrl
    ? getImageUrl(court.imageUrl)
    : `https://placehold.co/300x200/${colors[index]}/ffffff?text=Foto+${index + 1}`;
}

export default function CourtDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();

  const [court, setCourt]                 = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [galleryOpen, setGalleryOpen]     = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/courts/${id}`)
      .then(res => {
        setCourt(res.data);
        setSelectedImage(res.data.imageUrl ? getImageUrl(res.data.imageUrl) : null);
      })
      .catch(() => setError('No se pudo cargar la información de la cancha.'))
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Loading skeleton ── */
  if (loading) return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Skeleton variant="rectangular" height={56} sx={{ mb: 2, borderRadius: 2 }} />
      <Skeleton variant="rectangular" height={420} sx={{ borderRadius: 3, mb: 3 }} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}><Skeleton height={200} /></Grid>
        <Grid item xs={12} md={6}><Skeleton height={200} /></Grid>
      </Grid>
    </Container>
  );

  if (error) return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Alert severity="error">{error}</Alert>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mt: 2 }}>
        Volver al inicio
      </Button>
    </Container>
  );

  if (!court) return null;

  // Modelo de datos: court.category es un objeto { id, title, description, imageUrl }
  const categoryTitle = court.category?.title || (typeof court.category === 'string' ? court.category : 'General');
  const mainImage = selectedImage
    || (court.imageUrl ? getImageUrl(court.imageUrl) : `https://placehold.co/800x480/0A2540/ffffff?text=${encodeURIComponent(court.name)}`);

  const secondaryImages = [0, 1, 2, 3].map(i => ({
    url: getSecondaryImageUrl(court, i),
    label: `Foto ${i + 1}`,
  }));

  // Lista de características de la cancha (HU18)
  const featuresList = Array.isArray(court.features)
    ? court.features
    : (court.features ? Array.from(court.features) : []);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>

      {/* ══════════════════════════════════════════════════════════
          HU5 — Detail header strip: título izquierda, flecha derecha
      ══════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          id="court-title"
          variant="h4"
          component="h1"
          fontWeight={800}
          color="primary.main"
          sx={{ lineHeight: 1.2 }}
        >
          {court.name}
        </Typography>

        <Button
          id="btn-volver"
          endIcon={<ArrowBackIcon sx={{ transform: 'scaleX(-1)' }} />}
          onClick={() => navigate('/')}
          variant="outlined"
          color="primary"
          sx={{ fontWeight: 600, borderRadius: 2, flexShrink: 0, ml: 2 }}
        >
          Volver al listado
        </Button>
      </Box>

      {/* ══════════════════════════════════════════════════════════
          HU6 — Gallery block
      ══════════════════════════════════════════════════════════ */}
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            width: '100%',
            minHeight: { md: 420 },
          }}
        >
          {/* ─── LEFT HALF: imagen principal ─── */}
          <Box
            sx={{
              flex: '0 0 50%',
              position: 'relative',
              bgcolor: '#0A0F1A',
              minHeight: { xs: 260, md: 420 },
            }}
          >
            <Box
              component="img"
              src={mainImage}
              alt={court.name}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </Box>

          {/* ─── RIGHT HALF: grilla 2×2 miniaturas + botón "Ver más" ─── */}
          <Box
            sx={{
              flex: '0 0 50%',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: '#111827',
            }}
          >
            <Box
              sx={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                gap: '2px',
                p: '2px',
              }}
            >
              {secondaryImages.map((img, i) => (
                <Box
                  key={i}
                  component="img"
                  src={img.url}
                  alt={img.label}
                  onClick={() => setSelectedImage(img.url)}
                  sx={{
                    width: '100%',
                    height: '100%',
                    minHeight: { xs: 120, md: 180 },
                    objectFit: 'cover',
                    display: 'block',
                    cursor: 'pointer',
                    outline: selectedImage === img.url ? '2px solid #2FBF71' : '2px solid transparent',
                    outlineOffset: '-2px',
                    transition: 'outline-color 0.2s, opacity 0.2s',
                    '&:hover': { opacity: 0.85 },
                  }}
                />
              ))}
            </Box>

            {/* "Ver más" galería */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                px: 2,
                py: 1.5,
                bgcolor: 'rgba(0,0,0,0.6)',
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Typography
                id="btn-ver-galeria"
                onClick={() => setGalleryOpen(true)}
                sx={{
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  letterSpacing: '0.02em',
                  '&:hover': { color: '#2FBF71' },
                  transition: 'color 0.2s',
                }}
              >
                Ver más →
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* ══════════════════════════════════════════════════════════
          HU5 — Body: descripción + info + CTA
      ══════════════════════════════════════════════════════════ */}
      <Grid container spacing={4}>
        {/* Descripción */}
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip
              icon={<SportsSoccerIcon />}
              label={categoryTitle}
              sx={{ bgcolor: '#E8F5E9', color: '#1E7F3B', fontWeight: 700, textTransform: 'capitalize' }}
            />
            <Chip
              icon={<GroupIcon />}
              label={`${court.capacity} personas`}
              sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', fontWeight: 600 }}
            />
          </Box>
          <Typography
            id="court-description"
            variant="body1"
            color="text.secondary"
            sx={{ lineHeight: 1.9 }}
          >
            {court.description}
          </Typography>
        </Grid>

        {/* Info + CTA de Reserva */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
              <InfoItem icon="⏱️" label="Bloque" value="1 hora" />
              <InfoItem icon="📍" label="Disponibilidad" value="En tiempo real" />
              <InfoItem icon="🏆" label="Deporte" value={categoryTitle} />
              <InfoItem icon="👥" label="Capacidad" value={`${court.capacity} pers.`} />
            </Box>
            <Button
              id="btn-reservar"
              variant="contained"
              color="success"
              size="large"
              fullWidth
              startIcon={<CalendarTodayIcon />}
              sx={{ py: 2, fontSize: '1.05rem', fontWeight: 700, borderRadius: 2 }}
            >
              Reservar Bloque Horario
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* ══════════════════════════════════════════════════════════
          HU18 — Bloque Características (con ícono y nombre)
      ══════════════════════════════════════════════════════════ */}
      <Box sx={{ mt: 5 }} id="bloque-caracteristicas">
        <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
          Características
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {featuresList.length > 0 ? (
          <Grid container spacing={2}>
            {featuresList.map((feat) => (
              <Grid item xs={12} sm={6} md={3} key={feat.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      borderColor: 'primary.light',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'rgba(30, 127, 59, 0.1)',
                      color: 'success.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <FeatureIcon name={feat.icon} />
                  </Box>
                  <Typography variant="body2" fontWeight={600} color="text.primary">
                    {feat.name}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 2, bgcolor: 'background.default', border: '1px dashed', borderColor: 'divider' }}
          >
            <Typography variant="body2" color="text.secondary">
              Esta cancha no tiene características adicionales registradas en este momento.
            </Typography>
          </Paper>
        )}
      </Box>

      {/* ══════════════════════════════════════════════════════════
          FULL GALLERY DIALOG
      ══════════════════════════════════════════════════════════ */}
      <Dialog
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, bgcolor: '#0A0F1A' } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h6" color="white" fontWeight={700}>
            Galería — {court.name}
          </Typography>
          <IconButton id="btn-close-gallery" onClick={() => setGalleryOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 2 }}>
          <Box
            component="img"
            src={mainImage}
            alt={court.name}
            sx={{ width: '100%', borderRadius: 2, maxHeight: 360, objectFit: 'cover', mb: 2 }}
          />
          <Grid container spacing={1}>
            {secondaryImages.map((img, i) => (
              <Grid item key={i} xs={6} sm={3}>
                <Box
                  component="img"
                  src={img.url}
                  alt={img.label}
                  onClick={() => setSelectedImage(img.url)}
                  sx={{
                    width: '100%', height: 90, objectFit: 'cover',
                    borderRadius: 1, cursor: 'pointer',
                    outline: selectedImage === img.url ? '2px solid #2FBF71' : '2px solid transparent',
                    outlineOffset: '-2px',
                    transition: 'outline-color 0.2s',
                    '&:hover': { opacity: 0.85 },
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

/* ── Mini info item ── */
function InfoItem({ icon, label, value }) {
  return (
    <Box sx={{ bgcolor: 'background.default', borderRadius: 2, p: 1.5, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="caption" color="text.secondary" display="block" mb={0.3}>
        {icon} {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} textTransform="capitalize">{value}</Typography>
    </Box>
  );
}
