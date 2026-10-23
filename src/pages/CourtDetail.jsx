import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Button, Grid, Paper, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Chip, Skeleton, Alert, Rating, TextField, Tooltip, Snackbar,
  Avatar, Stack
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon         from '@mui/icons-material/ArrowBack';
import CloseIcon             from '@mui/icons-material/Close';
import GroupIcon             from '@mui/icons-material/Group';
import SportsSoccerIcon      from '@mui/icons-material/SportsSoccer';
import CalendarTodayIcon     from '@mui/icons-material/CalendarToday';
import FavoriteIcon          from '@mui/icons-material/Favorite';
import FavoriteBorderIcon    from '@mui/icons-material/FavoriteBorder';
import ShareIcon             from '@mui/icons-material/Share';
import ContentCopyIcon       from '@mui/icons-material/ContentCopy';
import RefreshIcon           from '@mui/icons-material/Refresh';
import StarIcon              from '@mui/icons-material/Star';
import GavelIcon             from '@mui/icons-material/Gavel';
import CancelOutlinedIcon    from '@mui/icons-material/CancelOutlined';
import HealthAndSafetyIcon   from '@mui/icons-material/HealthAndSafety';
import WhatsAppIcon          from '@mui/icons-material/WhatsApp';
import FacebookIcon          from '@mui/icons-material/Facebook';
import TwitterIcon           from '@mui/icons-material/Twitter';
import InstagramIcon         from '@mui/icons-material/Instagram';
import ChevronLeftIcon       from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon      from '@mui/icons-material/ChevronRight';
import CheckCircleIcon       from '@mui/icons-material/CheckCircle';

import api, { getImageUrl } from '../api/axiosConfig';
import FeatureIcon from '../components/FeatureIcon';
import { useAuth } from '../context/AuthContext';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_LABELS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

function formatIsoDate(year, month, day) {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function getSecondaryImageUrl(court, index) {
  const colors = ['1E7F3B', '0A2540', '2FBF71', '6B7280'];
  return court.imageUrl
    ? getImageUrl(court.imageUrl)
    : `https://placehold.co/300x200/${colors[index]}/ffffff?text=Foto+${index + 1}`;
}

export default function CourtDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  /* ── Estados principales ── */
  const [court, setCourt]                 = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [galleryOpen, setGalleryOpen]     = useState(false);

  /* ── HU23: Disponibilidad y calendario doble ── */
  const [occupiedDates, setOccupiedDates]         = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [currentCalendarDate, setCurrentCalendarDate] = useState(() => new Date());

  /* ── HU24: Favoritos ── */
  const [isFavorite, setIsFavorite]       = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  /* ── HU27: Compartir en redes ── */
  const [shareOpen, setShareOpen]         = useState(false);
  const [customShareMessage, setCustomShareMessage] = useState('');
  const [copyFeedback, setCopyFeedback]   = useState(false);

  /* ── HU28: Calificaciones y Reseñas ── */
  const [reviews, setReviews]             = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [userRating, setUserRating]       = useState(5);
  const [userComment, setUserComment]     = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState({ type: '', text: '' });

  /* ── Snackbar global ── */
  const [snackbarMessage, setSnackbarMessage] = useState('');

  /* ── Cargar información de cancha ── */
  const fetchCourt = () => {
    setLoading(true);
    setError('');
    api.get(`/courts/${id}`)
      .then(res => {
        setCourt(res.data);
        setSelectedImage(res.data.imageUrl ? getImageUrl(res.data.imageUrl) : null);
        setCustomShareMessage(`¡Hola! Te recomiendo la cancha "${res.data.name}" en Sport Court Booking. ¿Jugamos un partido?`);
      })
      .catch(() => setError('No se pudo cargar la información de la cancha.'))
      .finally(() => setLoading(false));
  };

  /* ── HU23: Cargar disponibilidad de fechas ── */
  const fetchAvailability = () => {
    setAvailabilityLoading(true);
    setAvailabilityError('');
    api.get(`/courts/${id}/availability`)
      .then(res => {
        setOccupiedDates(res.data?.occupiedDates || []);
      })
      .catch(() => {
        setAvailabilityError('No se pudo sincronizar la disponibilidad del calendario.');
      })
      .finally(() => setAvailabilityLoading(false));
  };

  /* ── HU24: Comprobar si la cancha es favorita ── */
  const checkFavorite = () => {
    if (user) {
      api.get('/favorites/ids')
        .then(res => {
          const ids = res.data || [];
          setIsFavorite(ids.includes(Number(id)));
        })
        .catch(() => setIsFavorite(false));
    } else {
      setIsFavorite(false);
    }
  };

  /* ── HU28: Cargar reseñas ── */
  const fetchReviews = () => {
    setReviewsLoading(true);
    api.get(`/courts/${id}/reviews`)
      .then(res => {
        setReviews(res.data || []);
      })
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  };

  useEffect(() => {
    fetchCourt();
    fetchAvailability();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    checkFavorite();
  }, [id, user]);

  /* ── HU24: Alternar favorito ── */
  const handleToggleFavorite = async () => {
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }
    setFavoriteLoading(true);
    try {
      const res = await api.post(`/favorites/${id}/toggle`);
      const nextState = res.data?.isFavorite;
      setIsFavorite(nextState);
      setSnackbarMessage(
        nextState
          ? `❤️ "${court?.name}" agregada a tus favoritos`
          : `"${court?.name}" removida de favoritos`
      );
    } catch {
      setSnackbarMessage('Error al actualizar el estado de favoritos');
    } finally {
      setFavoriteLoading(false);
    }
  };

  /* ── HU28: Enviar nueva valoración y comentario ── */
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }
    if (!userRating || userRating < 1 || userRating > 5) {
      setReviewMessage({ type: 'error', text: 'Por favor selecciona una puntuación entre 1 y 5 estrellas.' });
      return;
    }

    setSubmittingReview(true);
    setReviewMessage({ type: '', text: '' });
    try {
      const res = await api.post(`/courts/${id}/reviews`, {
        rating: userRating,
        comment: userComment.trim()
      });

      // Actualizar lista local de reseñas
      setReviews(prev => [res.data, ...prev]);
      setUserComment('');
      setReviewMessage({ type: 'success', text: '¡Gracias! Tu valoración ha sido publicada con éxito.' });

      // Recargar datos actualizados de la cancha (promedio dinámico de estrellas y total reseñas)
      api.get(`/courts/${id}`).then(cRes => setCourt(cRes.data)).catch(() => {});
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al publicar la reseña. Inténtalo nuevamente.';
      setReviewMessage({ type: 'error', text: msg });
    } finally {
      setSubmittingReview(false);
    }
  };

  /* ── HU27: Funciones para compartir en redes sociales ── */
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
      setSnackbarMessage('Enlace copiado al portapapeles');
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${customShareMessage}\n${currentUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(currentUrl);
    const quote = encodeURIComponent(customShareMessage);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(customShareMessage);
    const url = encodeURIComponent(currentUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareInstagram = () => {
    handleCopyLink();
    setSnackbarMessage('¡Enlace copiado! Pégalo en tu historia o mensaje directo en Instagram.');
  };

  /* ── HU23: Navegación de meses para el calendario doble ── */
  const handlePrevMonth = () => {
    const now = new Date();
    const newDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1);
    // No retroceder a meses anteriores al actual
    if (newDate.getFullYear() < now.getFullYear() || (newDate.getFullYear() === now.getFullYear() && newDate.getMonth() < now.getMonth())) {
      return;
    }
    setCurrentCalendarDate(newDate);
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1));
  };

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

  const categoryTitle = court.category?.title || (typeof court.category === 'string' ? court.category : 'General');
  const mainImage = selectedImage
    || (court.imageUrl ? getImageUrl(court.imageUrl) : `https://placehold.co/800x480/0A2540/ffffff?text=${encodeURIComponent(court.name)}`);

  const secondaryImages = [0, 1, 2, 3].map(i => ({
    url: getSecondaryImageUrl(court, i),
    label: `Foto ${i + 1}`,
  }));

  const featuresList = Array.isArray(court.features)
    ? court.features
    : (court.features ? Array.from(court.features) : []);

  /* ── Cálculos de fechas de los 2 meses visibles ── */
  const firstMonthDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1);
  const secondMonthDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isPrevDisabled = (
    firstMonthDate.getFullYear() === today.getFullYear() &&
    firstMonthDate.getMonth() === today.getMonth()
  );

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>

      {/* ══════════════════════════════════════════════════════════
          HU5 / HU24 / HU27 — Header strip con título, favorito, compartir y volver
      ══════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
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

          {/* HU28: Rating Badge en encabezado */}
          {court.averageRating != null && court.averageRating > 0 && (
            <Chip
              icon={<StarIcon sx={{ color: '#F59E0B !important', fontSize: '1.1rem' }} />}
              label={`${Number(court.averageRating).toFixed(1)} (${court.reviewCount || 0})`}
              size="small"
              sx={{
                bgcolor: '#FEF3C7',
                color: '#92400E',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            />
          )}
        </Box>

        {/* Acciones principales: Favorito + Compartir + Volver */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, alignSelf: { xs: 'flex-end', sm: 'center' } }}>
          {/* HU24: Botón de favorito */}
          <Tooltip title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
            <IconButton
              id="btn-toggle-favorite-detail"
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              sx={{
                color: isFavorite ? '#EF4444' : 'text.secondary',
                bgcolor: isFavorite ? 'rgba(239, 68, 68, 0.08)' : 'background.paper',
                border: '1px solid',
                borderColor: isFavorite ? '#FCA5A5' : 'divider',
                '&:hover': {
                  bgcolor: isFavorite ? 'rgba(239, 68, 68, 0.16)' : 'rgba(0,0,0,0.04)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s',
              }}
            >
              {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Tooltip>

          {/* HU27: Botón Compartir */}
          <Tooltip title="Compartir en redes sociales">
            <Button
              id="btn-share-court"
              variant="outlined"
              color="primary"
              startIcon={<ShareIcon />}
              onClick={() => setShareOpen(true)}
              sx={{ fontWeight: 600, borderRadius: 2 }}
            >
              Compartir
            </Button>
          </Tooltip>

          {/* Botón Volver */}
          <Button
            id="btn-volver"
            endIcon={<ArrowBackIcon sx={{ transform: 'scaleX(-1)' }} />}
            onClick={() => navigate('/')}
            variant="outlined"
            color="inherit"
            sx={{ fontWeight: 600, borderRadius: 2 }}
          >
            Volver
          </Button>
        </Box>
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
          {/* Imagen principal */}
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

          {/* Grilla 2x2 miniaturas + botón "Ver más" */}
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
              onClick={() => {
                const calElem = document.getElementById('bloque-disponibilidad');
                if (calElem) calElem.scrollIntoView({ behavior: 'smooth' });
              }}
              sx={{ py: 2, fontSize: '1.05rem', fontWeight: 700, borderRadius: 2 }}
            >
              Consultar Calendario de Disponibilidad
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* ══════════════════════════════════════════════════════════
          HU18 — Bloque Características
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
          HU23 — Visualizar disponibilidad (Calendario doble)
      ══════════════════════════════════════════════════════════ */}
      <Box sx={{ mt: 6 }} id="bloque-disponibilidad">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary.main">
              Fechas Disponibles
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Consulta en tiempo real la disponibilidad y fechas reservadas en los próximos 2 meses.
            </Typography>
          </Box>

          {/* Controles de navegación de meses */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: { xs: 1, sm: 0 } }}>
            <Tooltip title="Mes anterior">
              <span>
                <IconButton
                  size="small"
                  onClick={handlePrevMonth}
                  disabled={isPrevDisabled}
                  sx={{ border: '1px solid', borderColor: 'divider' }}
                >
                  <ChevronLeftIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Mes siguiente">
              <IconButton
                size="small"
                onClick={handleNextMonth}
                sx={{ border: '1px solid', borderColor: 'divider' }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Actualizar disponibilidad">
              <IconButton
                size="small"
                onClick={fetchAvailability}
                disabled={availabilityLoading}
                sx={{ border: '1px solid', borderColor: 'divider' }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {/* Alerta de error con botón de reintento — HU23 */}
        {availabilityError && (
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={fetchAvailability} startIcon={<RefreshIcon />}>
                Reintentar
              </Button>
            }
            sx={{ mb: 3 }}
          >
            {availabilityError}
          </Alert>
        )}

        {/* Doble Calendario */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Grid container spacing={3}>
            {/* Mes 1 */}
            <Grid item xs={12} md={6}>
              <MonthCalendar
                date={firstMonthDate}
                occupiedDates={occupiedDates}
                today={today}
              />
            </Grid>

            {/* Mes 2 */}
            <Grid item xs={12} md={6}>
              <MonthCalendar
                date={secondMonthDate}
                occupiedDates={occupiedDates}
                today={today}
              />
            </Grid>
          </Grid>

          {/* Leyenda visual del calendario — HU23 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              mt: 3,
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              flexWrap: 'wrap',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 14, height: 14, borderRadius: '4px', bgcolor: '#E8F5E9', border: '1px solid #2FBF71' }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                Disponible
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 14, height: 14, borderRadius: '4px', bgcolor: '#FEE2E2', border: '1px solid #EF4444' }} />
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                Ocupado / Reservado
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 14, height: 14, borderRadius: '4px', bgcolor: '#F3F4F6', border: '1px solid #E5E7EB' }} />
              <Typography variant="caption" fontWeight={600} color="text.disabled">
                No disponible / Pasado
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* ══════════════════════════════════════════════════════════
          HU26 — Bloque de Políticas del Producto (100% ancho, título subrayado, 3 columnas)
      ══════════════════════════════════════════════════════════ */}
      <Box sx={{ width: '100%', mt: 6 }} id="bloque-politicas">
        {/* Título de 100% de ancho con subrayado formal */}
        <Typography
          id="product-policies-title"
          variant="h5"
          component="h2"
          fontWeight={800}
          color="primary.main"
          sx={{
            pb: 1.5,
            mb: 3,
            borderBottom: '2px solid',
            borderColor: 'primary.main',
            letterSpacing: '-0.01em',
          }}
        >
          Políticas de la Cancha
        </Typography>

        {/* Tres columnas organizadas: Normas, Cancelación y Salud/Indumentaria */}
        <Grid container spacing={3}>
          {/* Columna 1: Normas de convivencia */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: 'rgba(10, 37, 64, 0.08)',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <GavelIcon fontSize="small" />
                </Box>
                <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                  Normas de Convivencia
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                {court.rules ||
                  '• Respetar rigurosamente los horarios y bloques reservados.\n• Prohibido ingresar bebidas alcohólicas, sustancias ilícitas o envases de vidrio.\n• Cuidar las redes, arcos e iluminación de la instalación.\n• Mantener un trato cordial y de respeto deportivo en todo momento.'}
              </Typography>
            </Paper>
          </Grid>

          {/* Columna 2: Condiciones de cancelación */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: 'rgba(239, 68, 68, 0.08)',
                    color: '#EF4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CancelOutlinedIcon fontSize="small" />
                </Box>
                <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                  Condiciones de Cancelación
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                {court.cancellationPolicy ||
                  '• Cancelación sin costo hasta 24 horas antes del inicio del turno.\n• Cancelaciones con menos de 24 horas de antelación retendrán el 50% de la tarifa.\n• La inasistencia sin aviso previo no da derecho a reembolso ni reprogramación.\n• En caso de lluvia o fuerza mayor se reprogramará sin penalidad.'}
              </Typography>
            </Paper>
          </Grid>

          {/* Columna 3: Salud e indumentaria */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor: 'rgba(47, 191, 113, 0.1)',
                    color: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HealthAndSafetyIcon fontSize="small" />
                </Box>
                <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                  Salud e Indumentaria
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                {court.healthPolicy ||
                  '• Es obligatorio el uso de zapatillas adecuadas al tipo de superficie.\n• Se recomienda hidratación constante y ejercicios de precalentamiento.\n• Cada jugador es responsable de contar con aptitud física para la práctica deportiva.\n• Disponer de kit de primeros auxilios en administración si fuere necesario.'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* ══════════════════════════════════════════════════════════
          HU28 — Puntuar producto y Reseñas
      ══════════════════════════════════════════════════════════ */}
      <Box sx={{ mt: 6 }} id="bloque-calificaciones">
        <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
          Puntuación y Reseñas
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={4}>
          {/* Columna Izquierda: Resumen general y Formulario de nueva reseña */}
          <Grid item xs={12} md={5}>
            {/* Banner de resumen de promedio */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                textAlign: 'center',
                mb: 3,
              }}
            >
              <Typography variant="h3" fontWeight={800} color="primary.main">
                {court.averageRating ? Number(court.averageRating).toFixed(1) : '—'}
              </Typography>
              <Rating
                value={court.averageRating || 0}
                precision={0.1}
                readOnly
                sx={{ color: '#F59E0B', my: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {court.reviewCount && court.reviewCount > 0
                  ? `Basado en ${court.reviewCount} ${court.reviewCount === 1 ? 'opinión' : 'opiniones'}`
                  : 'Aún no cuenta con suficientes valoraciones'}
              </Typography>
            </Paper>

            {/* Formulario de valoración */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} color="primary.main" gutterBottom>
                Deja tu Valoración
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                Califica las instalaciones, estado del campo y atención recibida.
              </Typography>

              {reviewMessage.text && (
                <Alert severity={reviewMessage.type} sx={{ mb: 2 }}>
                  {reviewMessage.text}
                </Alert>
              )}

              {user ? (
                <Box component="form" onSubmit={handleSubmitReview}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="body2" fontWeight={600}>
                      Tu puntuación:
                    </Typography>
                    <Rating
                      name="user-court-rating"
                      value={userRating}
                      onChange={(e, val) => setUserRating(val || 5)}
                      sx={{ color: '#F59E0B' }}
                    />
                  </Box>

                  <TextField
                    id="input-review-comment"
                    label="Comentario u opinión"
                    multiline
                    rows={3}
                    fullWidth
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="Describe las condiciones del césped, iluminación, vestuarios..."
                    sx={{ mb: 2 }}
                  />

                  <Button
                    id="btn-submit-review"
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={submittingReview}
                    sx={{ fontWeight: 700, borderRadius: 2 }}
                  >
                    {submittingReview ? 'Publicando...' : 'Publicar Valoración'}
                  </Button>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Inicia sesión con tu cuenta para calificar y dejar una reseña sobre esta cancha.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate('/login')}
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  >
                    Iniciar Sesión
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Columna Derecha: Listado dinámico de reseñas */}
          <Grid item xs={12} md={7}>
            <Typography variant="subtitle1" fontWeight={700} color="primary.main" mb={2}>
              Opiniones de la Comunidad ({reviews.length})
            </Typography>

            {reviewsLoading ? (
              <Stack spacing={2}>
                <Skeleton variant="rounded" height={80} />
                <Skeleton variant="rounded" height={80} />
              </Stack>
            ) : reviews.length > 0 ? (
              <Stack spacing={2}>
                {reviews.map((rev) => {
                  const authorName = rev.userName || 'Usuario de Sport Court';
                  const initial = authorName.charAt(0).toUpperCase();
                  const dateStr = rev.createdAt
                    ? new Date(rev.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
                    : 'Reciente';

                  return (
                    <Paper
                      key={rev.id}
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 2.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 34, height: 34, fontSize: '0.9rem', fontWeight: 700 }}>
                            {initial}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={700} color="text.primary">
                              {authorName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {dateStr}
                            </Typography>
                          </Box>
                        </Box>
                        <Rating value={rev.rating} readOnly size="small" sx={{ color: '#F59E0B' }} />
                      </Box>
                      {rev.comment && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
                          {rev.comment}
                        </Typography>
                      )}
                    </Paper>
                  );
                })}
              </Stack>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 3,
                  border: '1px dashed',
                  borderColor: 'divider',
                  bgcolor: 'background.default',
                }}
              >
                <Typography variant="body1" fontWeight={600} color="text.secondary">
                  Aún no hay reseñas registradas
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  Sé el primero en compartir tu experiencia y ayudar a otros deportistas.
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* ══════════════════════════════════════════════════════════
          HU27 — Modal Compartir en Redes Sociales
      ══════════════════════════════════════════════════════════ */}
      <Dialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" fontWeight={700} color="primary.main">
            Compartir Producto
          </Typography>
          <IconButton onClick={() => setShareOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Comparte esta cancha con tus compañeros de equipo a través de redes sociales o enlace directo.
          </Typography>

          {/* Tarjeta de previsualización del producto — HU27 */}
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              gap: 2,
              p: 2,
              mb: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.default',
            }}
          >
            <Box
              component="img"
              src={mainImage}
              alt={court.name}
              sx={{ width: 90, height: 90, borderRadius: 1.5, objectFit: 'cover' }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Chip
                label={categoryTitle}
                size="small"
                sx={{ bgcolor: '#E8F5E9', color: '#1E7F3B', fontWeight: 700, mb: 0.5 }}
              />
              <Typography variant="subtitle2" fontWeight={700} noWrap color="text.primary">
                {court.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {court.description}
              </Typography>
            </Box>
          </Paper>

          {/* Mensaje personalizable — HU27 */}
          <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.5}>
            Mensaje para compartir:
          </Typography>
          <TextField
            id="share-custom-message"
            multiline
            rows={2}
            fullWidth
            value={customShareMessage}
            onChange={(e) => setCustomShareMessage(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Enlace directo y botón Copiar — HU27 */}
          <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.5}>
            Enlace directo:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <TextField
              size="small"
              fullWidth
              value={currentUrl}
              InputProps={{ readOnly: true }}
            />
            <Button
              id="btn-copy-share-link"
              variant={copyFeedback ? 'contained' : 'outlined'}
              color={copyFeedback ? 'success' : 'primary'}
              startIcon={copyFeedback ? <CheckCircleIcon /> : <ContentCopyIcon />}
              onClick={handleCopyLink}
              sx={{ flexShrink: 0, borderRadius: 2 }}
            >
              {copyFeedback ? '¡Copiado!' : 'Copiar'}
            </Button>
          </Box>

          <Divider sx={{ mb: 2.5 }} />

          {/* Botones de Redes Sociales — HU27 */}
          <Typography variant="subtitle2" fontWeight={700} color="primary.main" textAlign="center" mb={2}>
            Elige una red social:
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {/* WhatsApp */}
            <Grid item xs={6} sm={3}>
              <Button
                id="btn-share-whatsapp"
                fullWidth
                variant="outlined"
                startIcon={<WhatsAppIcon sx={{ color: '#25D366' }} />}
                onClick={handleShareWhatsApp}
                sx={{
                  borderColor: 'rgba(37, 211, 102, 0.4)',
                  color: 'text.primary',
                  borderRadius: 2,
                  py: 1,
                  fontWeight: 600,
                  '&:hover': { borderColor: '#25D366', bgcolor: 'rgba(37, 211, 102, 0.08)' }
                }}
              >
                WhatsApp
              </Button>
            </Grid>

            {/* Facebook */}
            <Grid item xs={6} sm={3}>
              <Button
                id="btn-share-facebook"
                fullWidth
                variant="outlined"
                startIcon={<FacebookIcon sx={{ color: '#1877F2' }} />}
                onClick={handleShareFacebook}
                sx={{
                  borderColor: 'rgba(24, 119, 242, 0.4)',
                  color: 'text.primary',
                  borderRadius: 2,
                  py: 1,
                  fontWeight: 600,
                  '&:hover': { borderColor: '#1877F2', bgcolor: 'rgba(24, 119, 242, 0.08)' }
                }}
              >
                Facebook
              </Button>
            </Grid>

            {/* Twitter / X */}
            <Grid item xs={6} sm={3}>
              <Button
                id="btn-share-twitter"
                fullWidth
                variant="outlined"
                startIcon={<TwitterIcon sx={{ color: '#000000' }} />}
                onClick={handleShareTwitter}
                sx={{
                  borderColor: 'rgba(0, 0, 0, 0.3)',
                  color: 'text.primary',
                  borderRadius: 2,
                  py: 1,
                  fontWeight: 600,
                  '&:hover': { borderColor: '#000000', bgcolor: 'rgba(0, 0, 0, 0.05)' }
                }}
              >
                X / Twitter
              </Button>
            </Grid>

            {/* Instagram */}
            <Grid item xs={6} sm={3}>
              <Button
                id="btn-share-instagram"
                fullWidth
                variant="outlined"
                startIcon={<InstagramIcon sx={{ color: '#E1306C' }} />}
                onClick={handleShareInstagram}
                sx={{
                  borderColor: 'rgba(225, 48, 108, 0.4)',
                  color: 'text.primary',
                  borderRadius: 2,
                  py: 1,
                  fontWeight: 600,
                  '&:hover': { borderColor: '#E1306C', bgcolor: 'rgba(225, 48, 108, 0.08)' }
                }}
              >
                Instagram
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════
          Modal Autenticación requerida para favoritos / reseñas
      ══════════════════════════════════════════════════════════ */}
      <Dialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>
          Inicio de Sesión Requerido
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Para guardar esta cancha en tu lista de favoritos o publicar tu calificación, necesitas iniciar sesión en tu cuenta de Sport Court.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAuthDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/login')}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Iniciar Sesión
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Snackbar feedback */}
      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessage('')}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
}

/* ── Componente Mes del Calendario Doble — HU23 ── */
function MonthCalendar({ date, occupiedDates, today }) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    daysArray.push(d);
  }

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} color="primary.main" textAlign="center" mb={1.5}>
        {MONTH_NAMES[month]} {year}
      </Typography>

      {/* Días de la semana */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 1, textAlign: 'center' }}>
        {DAY_LABELS.map(lbl => (
          <Typography key={lbl} variant="caption" fontWeight={700} color="text.secondary">
            {lbl}
          </Typography>
        ))}
      </Box>

      {/* Celdas del mes */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
        {daysArray.map((day, idx) => {
          if (day === null) {
            return <Box key={`empty-${idx}`} sx={{ height: 36 }} />;
          }

          const cellDate = new Date(year, month, day);
          cellDate.setHours(0, 0, 0, 0);

          const isoStr = formatIsoDate(year, month, day);
          const isPast = cellDate < today;
          const isOccupied = occupiedDates.includes(isoStr);
          const isAvailable = !isPast && !isOccupied;

          let bg = 'background.paper';
          let textColor = 'text.primary';
          let border = '1px solid #E5E7EB';
          let textDecor = 'none';
          let tooltipTitle = 'Disponible para reserva';

          if (isPast) {
            bg = '#F3F4F6';
            textColor = '#9CA3AF';
            border = '1px solid #E5E7EB';
            tooltipTitle = 'Fecha pasada';
          } else if (isOccupied) {
            bg = '#FEE2E2';
            textColor = '#DC2626';
            border = '1px solid #FCA5A5';
            textDecor = 'line-through';
            tooltipTitle = 'Fecha ocupada / reservada';
          } else {
            bg = '#F0FDF4';
            textColor = '#166534';
            border = '1px solid #86EFAC';
            tooltipTitle = 'Fecha disponible';
          }

          return (
            <Tooltip key={`day-${day}`} title={tooltipTitle} arrow>
              <Box
                sx={{
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1.5,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  bgcolor: bg,
                  color: textColor,
                  border: border,
                  textDecoration: textDecor,
                  cursor: isAvailable ? 'pointer' : 'default',
                  transition: 'all 0.15s',
                  '&:hover': isAvailable ? { bgcolor: '#DCFCE7', borderColor: '#22C55E' } : {}
                }}
              >
                {day}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
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
