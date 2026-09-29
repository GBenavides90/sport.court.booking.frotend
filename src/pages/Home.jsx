import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, CardMedia, CardActions,
  Button, TextField, Box, Chip, InputAdornment, CircularProgress, Alert,
  IconButton, Skeleton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const PAGE_SIZE = 10;

/* ── HU2: Sport categories ── */
const SPORT_CATEGORIES = [
  { key: '',        label: 'Todos',   icon: '🏟️' },
  { key: 'futbol',  label: 'Fútbol',  icon: '⚽' },
  { key: 'tenis',   label: 'Tenis',   icon: '🎾' },
  { key: 'padel',   label: 'Pádel',   icon: '🏓' },
  { key: 'squash',  label: 'Squash',  icon: '🏸' },
  { key: 'basquet', label: 'Básquet', icon: '🏀' },
];

export default function Home() {
  const [courts, setCourts]           = useState([]);
  const [search, setSearch]           = useState('');
  const [category, setCategory]       = useState('');
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const navigate = useNavigate();

  /* ── Fetch paginated courts — HU4: random=true (ORDER BY RAND()) ── */
  const fetchCourts = (pageNum = 0) => {
    setLoading(true);
    setError('');
    axios.get(`${API_URL}/api/courts`, { params: { page: pageNum, size: PAGE_SIZE, random: true } })
      .then(res => {
        const data = res.data;
        // Client-side shuffle as extra guarantee of randomness
        const shuffled = [...(data.content || [])].sort(() => Math.random() - 0.5);
        setCourts(shuffled);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
        setPage(pageNum);
      })
      .catch(() => setError('No se pudo conectar con el servidor. Verifica que el backend esté activo.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourts(0); }, []);

  /* ── Filter by search + category (client-side on current page) ── */
  const filteredCourts = courts.filter(c => {
    const matchesSearch   = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || c.category?.toLowerCase() === category;
    return matchesSearch && matchesCategory;
  });

  /* ── Recommendations: first 3 of sorted list ── */
  const recommended = [...courts].slice(0, 3);

  /* ── Pagination handlers (HU8) ── */
  const handlePrev = () => { if (page > 0) fetchCourts(page - 1); };
  const handleNext = () => { if (page < totalPages - 1) fetchCourts(page + 1); };

  return (
    <Box>
      {/* ═══════════════════════════════════════════════
          HERO SECTION — HU2
      ═══════════════════════════════════════════════ */}
      <Box
        className="hero-section"
        sx={{ py: { xs: 6, md: 10 }, px: 2, textAlign: 'center' }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h2"
            component="h1"
            fontWeight={800}
            sx={{
              color: 'white',
              fontSize: { xs: '2rem', md: '3rem' },
              lineHeight: 1.2,
              mb: 2,
              letterSpacing: '-0.02em',
            }}
          >
            Reserva tu cancha ideal
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.75)', mb: 5, fontWeight: 400 }}>
            Encuentra los mejores espacios deportivos — rápido, fácil y en tiempo real
          </Typography>

          {/* Search bar — HU2 / TC-05 */}
          <Box sx={{
            display: 'flex', gap: 1, maxWidth: 600, mx: 'auto',
            bgcolor: 'white', borderRadius: 3, p: 0.5, boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
          }}>
            <TextField
              id="search-courts"
              fullWidth
              variant="standard"
              placeholder="Buscar cancha por nombre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', ml: 1 }} />
                  </InputAdornment>
                ),
                sx: { px: 1, py: 1 }
              }}
            />
            <Button
              variant="contained"
              color="secondary"
              sx={{ borderRadius: 2, px: 3, whiteSpace: 'nowrap' }}
            >
              Buscar
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -3 }}>
        {/* ═══════════════════════════════════════════════
            SPORT CATEGORIES — HU2 / TC-06
        ═══════════════════════════════════════════════ */}
        <Box sx={{ mb: 6 }}>
          <Grid container spacing={2} justifyContent="center">
            {SPORT_CATEGORIES.map(cat => (
              <Grid item key={cat.key} xs={6} sm={4} md={2}>
                <Box
                  id={`category-${cat.key || 'all'}`}
                  className={`sport-category-card ${category === cat.key ? 'active' : ''}`}
                  onClick={() => { setCategory(cat.key); setSearch(''); }}
                  sx={{
                    bgcolor: category === cat.key ? 'primary.main' : 'background.paper',
                    color: category === cat.key ? 'white' : 'text.primary',
                  }}
                >
                  <span className="sport-icon">{cat.icon}</span>
                  <Typography variant="body2" fontWeight={600}>{cat.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ═══════════════════════════════════════════════
            RECOMENDACIONES — HU2 / TC-07
        ═══════════════════════════════════════════════ */}
        {!loading && recommended.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <StarIcon sx={{ color: '#F59E0B' }} />
              <Typography variant="h5" fontWeight={700} color="primary.main">
                Recomendaciones
              </Typography>
              <Chip label="Top espacios" size="small" sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 600 }} />
            </Box>
            <Grid container spacing={3}>
              {recommended.map(court => (
                <Grid item key={`rec-${court.id}`} xs={12} sm={6} md={4}>
                  <RecommendationCard court={court} navigate={navigate} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* ═══════════════════════════════════════════════
            COURTS GRID — HU4 (max 10 / page)
        ═══════════════════════════════════════════════ */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h5" fontWeight={700} color="primary.main">
            Canchas Disponibles
          </Typography>
          {!loading && (
            <Typography variant="body2" color="text.secondary">
              {filteredCourts.length > 0
                ? `Mostrando ${filteredCourts.length} de ${totalElements} canchas — Página ${page + 1} de ${Math.max(totalPages, 1)}`
                : 'Sin resultados'}
            </Typography>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Court cards grid — HU4: 2 columnas, 5 filas max */}
        {loading ? (
          <Grid container spacing={3}>
            {[...Array(4)].map((_, i) => (
              <Grid item key={i} xs={12} sm={6}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {filteredCourts.length > 0 ? filteredCourts.map(court => (
              <Grid item key={court.id} xs={12} sm={6}>
                <CourtCard court={court} navigate={navigate} />
              </Grid>
            )) : (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                  <Typography variant="h6">No se encontraron canchas</Typography>
                  <Typography variant="body2" mt={1}>
                    Intenta con otro término de búsqueda o categoría
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        )}

        {/* ═══════════════════════════════════════════════
            PAGINATION — HU8 / TC-22 / TC-23 / TC-24
        ═══════════════════════════════════════════════ */}
        {totalPages > 1 && (
          <Box className="pagination-container">
            {/* HU8: Ir al inicio */}
            <Button
              id="btn-first-page"
              variant="text"
              color="primary"
              onClick={() => fetchCourts(0)}
              disabled={page === 0}
              sx={{ fontWeight: 600, minWidth: 'auto' }}
            >
              « Inicio
            </Button>

            {/* TC-24: Botón anterior */}
            <Button
              id="btn-prev-page"
              variant="outlined"
              color="primary"
              startIcon={<ArrowBackIosNewIcon />}
              disabled={page === 0}
              onClick={handlePrev}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Anterior
            </Button>

            {/* Page indicators */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[...Array(totalPages)].map((_, idx) => (
                <Button
                  key={idx}
                  id={`btn-page-${idx + 1}`}
                  variant={page === idx ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => fetchCourts(idx)}
                  sx={{
                    minWidth: 40, height: 40, borderRadius: 2, p: 0,
                    fontWeight: page === idx ? 700 : 400,
                  }}
                >
                  {idx + 1}
                </Button>
              ))}
            </Box>

            {/* TC-23: Botón siguiente */}
            <Button
              id="btn-next-page"
              variant="outlined"
              color="primary"
              endIcon={<ArrowForwardIosIcon />}
              disabled={page >= totalPages - 1}
              onClick={handleNext}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Siguiente
            </Button>
          </Box>
        )}

        <Box sx={{ pb: 4 }} />
      </Container>
    </Box>
  );
}

/* ─── Sub-components ─── */

function CourtCard({ court, navigate }) {
  return (
    <Card
      className="court-card"
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <CardMedia
        component="img"
        height="200"
        image={
          court.imageUrl
            ? `${API_URL}${court.imageUrl}`
            : `https://placehold.co/400x200/0A2540/ffffff?text=${encodeURIComponent(court.name)}`
        }
        alt={court.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2" fontWeight={700} noWrap>
          {court.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <Chip
            label={court.category}
            size="small"
            sx={{ bgcolor: '#E8F5E9', color: '#1E7F3B', fontWeight: 600, textTransform: 'capitalize' }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
          <GroupIcon fontSize="small" />
          <Typography variant="body2">Capacidad: {court.capacity} personas</Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          id={`btn-ver-detalles-${court.id}`}
          variant="contained"
          color="secondary"
          fullWidth
          onClick={() => navigate(`/court/${court.id}`)}
          sx={{ borderRadius: 2, py: 1 }}
        >
          Ver Detalles
        </Button>
      </CardActions>
    </Card>
  );
}

function RecommendationCard({ court, navigate }) {
  return (
    <Card
      className="court-card"
      sx={{
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
      onClick={() => navigate(`/court/${court.id}`)}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="160"
          image={
            court.imageUrl
              ? `${API_URL}${court.imageUrl}`
              : `https://placehold.co/400x160/1E7F3B/ffffff?text=${encodeURIComponent(court.name)}`
          }
          alt={court.name}
          sx={{ objectFit: 'cover' }}
        />
        <Box sx={{
          position: 'absolute', top: 10, right: 10,
          bgcolor: '#F59E0B', borderRadius: 1, px: 1, py: 0.3,
          display: 'flex', alignItems: 'center', gap: 0.3
        }}>
          <StarIcon sx={{ fontSize: 14, color: 'white' }} />
          <Typography variant="caption" fontWeight={700} color="white">Top</Typography>
        </Box>
      </Box>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={700} noWrap>{court.name}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
          <LocationOnIcon fontSize="small" />
          <Typography variant="body2" textTransform="capitalize">{court.category}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
