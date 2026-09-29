import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Button, Grid, Paper, Divider,
  Dialog, DialogContent, IconButton, Chip, Skeleton, Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon        from '@mui/icons-material/ArrowBack';
import CloseIcon            from '@mui/icons-material/Close';
import GroupIcon            from '@mui/icons-material/Group';
import SportsSoccerIcon     from '@mui/icons-material/SportsSoccer';
import CalendarTodayIcon    from '@mui/icons-material/CalendarToday';

const API_URL = import.meta.env.VITE_API_URL;

/* ── Helper: secondary image urls ── */
function getSecondaryImageUrl(court, index) {
  const colors = ['1E7F3B', '0A2540', '2FBF71', '6B7280'];
  return court.imageUrl
    ? `${API_URL}${court.imageUrl}`
    : `https://placehold.co/300x200/${colors[index]}/ffffff?text=Foto+${index + 1}`;
}

export default function CourtDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();

  const [court, setCourt]                 = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [galleryOpen, setGalleryOpen]     = useState(false);   // TC-19

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/api/courts/${id}`)
      .then(res => {
        setCourt(res.data);
        setSelectedImage(res.data.imageUrl ? `${API_URL}${res.data.imageUrl}` : null);
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

  const mainImage = selectedImage
    || (court.imageUrl ? `${API_URL}${court.imageUrl}` : `https://placehold.co/800x480/0A2540/ffffff?text=${encodeURIComponent(court.name)}`);

  /* TC-18: 4 secondary images */
  const secondaryImages = [0, 1, 2, 3].map(i => ({
    url: getSecondaryImageUrl(court, i),
    label: `Foto ${i + 1}`,
  }));

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>

      {/* ══════════════════════════════════════════════════════════
          HU5 — Detail header strip: título izquierda, flecha derecha
          TC-14: título visible | TC-16: flecha "volver" a la derecha
      ══════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',   // título LEFT, flecha RIGHT
          mb: 3,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* TC-14: Título alineado a la izquierda */}
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

        {/* TC-16: Flecha volver alineada a la DERECHA */}
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
          HU6 — Gallery block: 100% ancho, imagen principal IZQUIERDA,
          grilla 2×2 DERECHA — TC-17 / TC-18 / TC-19
      ══════════════════════════════════════════════════════════ */}
      <Paper
        elevation={0}
        sx={{
          width: '100%',             // 100% del ancho del contenedor
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
          {/* ─── LEFT HALF: imagen principal — TC-17 ─── */}
          <Box
            sx={{
              flex: '0 0 50%',
              position: 'relative',
              bgcolor: '#0A0F1A',
              minHeight: { xs: 260, md: 420 },
            }}
          >
            <Box
              id="gallery-main-image"
              component="img"
              src={mainImage}
              alt={court.name}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                position: { md: 'absolute' },
                inset: 0,
              }}
            />
          </Box>

          {/* ─── RIGHT HALF: grilla 2 filas × 2 columnas — TC-18 ─── */}
          <Box
            sx={{
              flex: '0 0 50%',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: '#060A10',
            }}
          >
            {/* 2×2 grid occupies full height of right half */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',   // 2 columnas
                gridTemplateRows: '1fr 1fr',       // 2 filas
                flexGrow: 1,
                gap: '2px',
                minHeight: { xs: 260, md: 380 },
              }}
            >
              {secondaryImages.map((img, i) => (
                <Box
                  key={i}
                  id={`gallery-thumb-${i + 1}`}
                  component="img"
                  src={img.url}
                  alt={img.label}
                  onClick={() => setSelectedImage(img.url)}
                  sx={{
                    width: '100%',
                    height: '100%',
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

            {/* ─── TC-19: "Ver más" en región inferior derecha ─── */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',       // alineado a la derecha
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
          HU5 — Body: descripción + info + CTA — TC-15
      ══════════════════════════════════════════════════════════ */}
      <Grid container spacing={4}>
        {/* TC-15: Description */}
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip
              icon={<SportsSoccerIcon />}
              label={court.category}
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

        {/* Info + CTA */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
              <InfoItem icon="⏱️" label="Bloque" value="1 hora" />
              <InfoItem icon="📍" label="Disponibilidad" value="En tiempo real" />
              <InfoItem icon="🏆" label="Deporte" value={court.category} />
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
          FULL GALLERY DIALOG — TC-19
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
          {/* Main preview */}
          <Box
            component="img"
            src={mainImage}
            alt={court.name}
            sx={{ width: '100%', borderRadius: 2, maxHeight: 360, objectFit: 'cover', mb: 2 }}
          />
          {/* Thumbnail strip */}
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
