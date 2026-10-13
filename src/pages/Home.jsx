import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, CardMedia, CardActions,
  Button, TextField, Box, Chip, InputAdornment, Skeleton, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import ClearIcon from '@mui/icons-material/Clear';
import { useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../api/axiosConfig';

const PAGE_SIZE = 10;

// Iconos/emojis por defecto según el nombre de la categoría
const CATEGORY_EMOJIS = {
  fútbol: '⚽',
  futbol: '⚽',
  tenis: '🎾',
  pádel: '🏓',
  padel: '🏓',
  squash: '🏸',
  básquet: '🏀',
  basquet: '🏀',
  natación: '🏊',
  natacion: '🏊',
  voleibol: '🏐',
  gimnasio: '🏋️',
};

function getCategoryIcon(title) {
  if (!title) return '🏟️';
  const clean = title.toLowerCase().trim();
  return CATEGORY_EMOJIS[clean] || '🏆';
}

export default function Home() {
  const [courts, setCourts]                     = useState([]);
  const [categories, setCategories]             = useState([]);
  const [search, setSearch]                     = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [page, setPage]                         = useState(0);
  const [totalPages, setTotalPages]             = useState(0);
  const [totalElements, setTotalElements]       = useState(0);
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState('');
  const navigate = useNavigate();

  /* ── HU12 / HU20: Cargar categorías desde la API (/api/categories) ── */
  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data || []))
      .catch(() => {
        // En caso de que el backend no responda, mantenemos array vacío
        setCategories([]);
      });
  }, []);

  /* ── Fetch paginated courts — HU4: random=true (ORDER BY RAND()) ── */
  const fetchCourts = (pageNum = 0) => {
    setLoading(true);
    setError('');
    api.get('/courts', { params: { page: pageNum, size: PAGE_SIZE, random: true } })
      .then(res => {
        const data = res.data;
        const list = data.content || [];
        setCourts(list);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
        setPage(pageNum);
      })
      .catch(() => setError('No se pudo conectar con el servidor. Verifica que el backend esté activo.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourts(0); }, []);

  /* ── HU20: Selección y deselección de categorías (soporta multi-filtro) ── */
  const handleToggleCategory = (catId) => {
    setSelectedCategoryIds(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleSelectAllCategories = () => {
    setSelectedCategoryIds([]);
  };

  const handleClearFilters = () => {
    setSelectedCategoryIds([]);
    setSearch('');
  };

  /* ── Filter by search + categoryIds (client-side) ── */
  const filteredCourts = courts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const courtCatId = c.category?.id;
    const matchesCategory =
      selectedCategoryIds.length === 0 || (courtCatId && selectedCategoryIds.includes(courtCatId));
    return matchesSearch && matchesCategory;
  });

  /* ── Recommendations: primeras 3 canchas ── */
  const recommended = [...courts].slice(0, 3);

  /* ── Pagination handlers (HU8) ── */
  const handlePrev = () => { if (page > 0) fetchCourts(page - 1); };
  const handleNext = () => { if (page < totalPages - 1) fetchCourts(page + 1); };

  const isFiltered = selectedCategoryIds.length > 0 || search.trim() !== '';

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
            SPORT CATEGORIES — HU20: Obtenidas desde la API
        ═══════════════════════════════════════════════ */}
        <Box sx={{ mb: 5 }}>
          <Grid container spacing={2} justifyContent="center">
            {/* Opción "Todas" */}
            <Grid item xs={6} sm={4} md={2}>
              <Box
                id="category-all"
                className={`sport-category-card ${selectedCategoryIds.length === 0 ? 'active' : ''}`}
                onClick={handleSelectAllCategories}
                sx={{
                  bgcolor: selectedCategoryIds.length === 0 ? 'primary.main' : 'background.paper',
                  color: selectedCategoryIds.length === 0 ? 'white' : 'text.primary',
                  cursor: 'pointer',
                  p: 2,
                  borderRadius: 2,
                  textAlign: 'center',
                  boxShadow: 1,
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-2px)' }
                }}
              >
                <span className="sport-icon" style={{ fontSize: '1.75rem', display: 'block', marginBottom: 4 }}>🏟️</span>
                <Typography variant="body2" fontWeight={600}>Todas</Typography>
              </Box>
            </Grid>

            {/* Categorías dinámicas desde la API */}
            {categories.map(cat => {
              const isSelected = selectedCategoryIds.includes(cat.id);
              return (
                <Grid item key={cat.id} xs={6} sm={4} md={2}>
                  <Box
                    id={`category-${cat.id}`}
                    className={`sport-category-card ${isSelected ? 'active' : ''}`}
                    onClick={() => handleToggleCategory(cat.id)}
                    sx={{
                      bgcolor: isSelected ? 'primary.main' : 'background.paper',
                      color: isSelected ? 'white' : 'text.primary',
                      cursor: 'pointer',
                      p: 2,
                      borderRadius: 2,
                      textAlign: 'center',
                      boxShadow: 1,
                      border: isSelected ? '2px solid #2FBF71' : '1px solid transparent',
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'translateY(-2px)' }
                    }}
                  >
                    <span className="sport-icon" style={{ fontSize: '1.75rem', display: 'block', marginBottom: 4 }}>
                      {getCategoryIcon(cat.title)}
                    </span>
                    <Typography variant="body2" fontWeight={600} noWrap title={cat.title}>
                      {cat.title}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* ═══════════════════════════════════════════════
            RECOMENDACIONES — HU2 / TC-07
        ═══════════════════════════════════════════════ */}
        {!loading && recommended.length > 0 && !isFiltered && (
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
            COURTS GRID — HU4 & HU20: Contador de resultados y reset de filtros
        ═══════════════════════════════════════════════ */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary.main">
              Canchas Disponibles
            </Typography>
            {!loading && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Mostrando <strong>{filteredCourts.length}</strong> de <strong>{totalElements}</strong> canchas registradas
                {selectedCategoryIds.length > 0 && ` (${selectedCategoryIds.length} categoría(s) seleccionada(s))`}
              </Typography>
            )}
          </Box>

          {isFiltered && (
            <Button
              id="btn-limpiar-filtros"
              variant="outlined"
              color="error"
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              Limpiar filtros
            </Button>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Court cards grid */}
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
                    Intenta con otro término de búsqueda o selecciona otra categoría
                  </Typography>
                  {isFiltered && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleClearFilters}
                      sx={{ mt: 2, borderRadius: 2 }}
                    >
                      Restablecer todos los filtros
                    </Button>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        )}

        {/* ═══════════════════════════════════════════════
            PAGINATION — HU8
        ═══════════════════════════════════════════════ */}
        {totalPages > 1 && (
          <Box className="pagination-container" sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 1, alignItems: 'center' }}>
            <Button
              id="btn-first-page"
              variant="text"
              color="primary"
              onClick={() => fetchCourts(0)}
              disabled={page === 0}
              sx={{ fontWeight: 600 }}
            >
              « Inicio
            </Button>

            <Button
              id="btn-prev-page"
              variant="outlined"
              color="primary"
              startIcon={<ArrowBackIosNewIcon />}
              disabled={page === 0}
              onClick={handlePrev}
              sx={{ borderRadius: 2, px: 2 }}
            >
              Anterior
            </Button>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {[...Array(totalPages)].map((_, idx) => (
                <Button
                  key={idx}
                  id={`btn-page-${idx + 1}`}
                  variant={page === idx ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => fetchCourts(idx)}
                  sx={{ minWidth: 38, height: 38, borderRadius: 2, p: 0, fontWeight: page === idx ? 700 : 400 }}
                >
                  {idx + 1}
                </Button>
              ))}
            </Box>

            <Button
              id="btn-next-page"
              variant="outlined"
              color="primary"
              endIcon={<ArrowForwardIosIcon />}
              disabled={page >= totalPages - 1}
              onClick={handleNext}
              sx={{ borderRadius: 2, px: 2 }}
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
  // Modelo de datos: court.category es un objeto { id, title, description, imageUrl }
  const categoryTitle = court.category?.title || (typeof court.category === 'string' ? court.category : 'General');
  const imageUrl = getImageUrl(court.imageUrl) || `https://placehold.co/400x200/0A2540/ffffff?text=${encodeURIComponent(court.name)}`;

  return (
    <Card
      className="court-card"
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <CardMedia
        component="img"
        height="200"
        image={imageUrl}
        alt={court.name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2" fontWeight={700} noWrap>
          {court.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <Chip
            label={categoryTitle}
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
  const categoryTitle = court.category?.title || (typeof court.category === 'string' ? court.category : 'General');
  const imageUrl = getImageUrl(court.imageUrl) || `https://placehold.co/400x160/1E7F3B/ffffff?text=${encodeURIComponent(court.name)}`;

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
          image={imageUrl}
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
          <Typography variant="body2" textTransform="capitalize">{categoryTitle}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
