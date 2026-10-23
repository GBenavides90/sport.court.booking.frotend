import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, CardMedia, CardActions,
  Button, TextField, Box, Chip, InputAdornment, Skeleton, Alert,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Paper, ClickAwayListener, Rating, Snackbar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import ClearIcon from '@mui/icons-material/Clear';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventIcon from '@mui/icons-material/Event';
import { useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 10;

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
  const [courts, setCourts]                           = useState([]);
  const [categories, setCategories]                   = useState([]);
  const [search, setSearch]                           = useState('');
  const [suggestions, setSuggestions]                 = useState([]);
  const [showSuggestions, setShowSuggestions]         = useState(false);
  const [startDate, setStartDate]                     = useState('');
  const [endDate, setEndDate]                         = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [page, setPage]                               = useState(0);
  const [totalPages, setTotalPages]                   = useState(0);
  const [totalElements, setTotalElements]             = useState(0);
  const [loading, setLoading]                         = useState(false);
  const [error, setError]                             = useState('');
  const [favoriteIds, setFavoriteIds]                 = useState([]);
  const [authDialogOpen, setAuthDialogOpen]           = useState(false);
  const [snackbarMessage, setSnackbarMessage]         = useState('');
  const [searchActive, setSearchActive]               = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  /* ── HU12 / HU20: Cargar categorías desde la API ── */
  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, []);

  /* ── HU24: Cargar IDs de canchas favoritas si el usuario está autenticado ── */
  const fetchFavoriteIds = () => {
    if (user) {
      api.get('/favorites/ids')
        .then(res => setFavoriteIds(res.data || []))
        .catch(() => setFavoriteIds([]));
    } else {
      setFavoriteIds([]);
    }
  };

  useEffect(() => {
    fetchFavoriteIds();
  }, [user]);

  /* ── Fetch paginated courts — HU4: random=true ── */
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
      .catch((err) => {
        const msg = err.response?.data?.message || 'No se pudo conectar con el servidor. Verifica que el backend esté activo.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourts(0); }, []);

  /* ── HU22: Sugerencias interactivas de autocompletado en tiempo real ── */
  useEffect(() => {
    if (search.trim().length >= 2) {
      api.get('/courts/suggestions', { params: { q: search.trim() } })
        .then(res => {
          setSuggestions(res.data || []);
          setShowSuggestions(true);
        })
        .catch(() => {
          // Fallback a filtrado local
          const localMatches = courts
            .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
            .map(c => c.name);
          setSuggestions(localMatches);
          setShowSuggestions(localMatches.length > 0);
        });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [search, courts]);

  /* ── HU22: Ejecutar búsqueda con palabra clave y fechas ── */
  const handlePerformSearch = (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    setSearchActive(Boolean(search.trim() || startDate || endDate));
  };

  /* ── HU20: Selección y deselección de categorías ── */
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
    setStartDate('');
    setEndDate('');
    setSearchActive(false);
  };

  /* ── HU24: Alternar favorito con un clic ── */
  const handleToggleFavorite = async (courtId, courtName, e) => {
    if (e) e.stopPropagation();
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }

    try {
      const res = await api.post(`/favorites/${courtId}/toggle`);
      const isFav = res.data?.isFavorite;
      if (isFav) {
        setFavoriteIds(prev => [...prev, courtId]);
        setSnackbarMessage(`❤️ "${courtName}" agregada a tus favoritos`);
      } else {
        setFavoriteIds(prev => prev.filter(id => id !== courtId));
        setSnackbarMessage(`"${courtName}" removida de favoritos`);
      }
    } catch {
      setSnackbarMessage('Error al actualizar favoritos');
    }
  };

  /* ── Filtrado dinámico ── */
  const filteredCourts = courts.filter(c => {
    const matchesSearch = !search.trim() || c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase())) ||
      (c.category?.title && c.category.title.toLowerCase().includes(search.toLowerCase()));
    const courtCatId = c.category?.id;
    const matchesCategory =
      selectedCategoryIds.length === 0 || (courtCatId && selectedCategoryIds.includes(courtCatId));
    return matchesSearch && matchesCategory;
  });

  const recommended = [...courts].slice(0, 3);
  const handlePrev = () => { if (page > 0) fetchCourts(page - 1); };
  const handleNext = () => { if (page < totalPages - 1) fetchCourts(page + 1); };

  const isFiltered = selectedCategoryIds.length > 0 || search.trim() !== '' || Boolean(startDate || endDate);

  return (
    <Box>
      {/* ═══════════════════════════════════════════════
          HERO & BLOQUE DE BÚSQUEDA — HU22 (Alta)
      ═══════════════════════════════════════════════ */}
      <Box
        className="hero-section"
        sx={{
          py: { xs: 6, md: 9 },
          px: 2,
          textAlign: 'center',
          bgcolor: 'primary.main',
          color: 'white',
          position: 'relative',
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Título claramente visible — HU22 */}
          <Typography
            id="search-block-title"
            variant="h2"
            component="h1"
            fontWeight={800}
            sx={{
              color: 'white',
              fontSize: { xs: '2.1rem', md: '3.2rem' },
              lineHeight: 1.2,
              mb: 1.5,
              letterSpacing: '-0.02em',
            }}
          >
            Encuentra y reserva tu cancha ideal
          </Typography>

          {/* Parágrafo informativo / descriptor — HU22 */}
          <Typography
            id="search-block-description"
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.85)',
              mb: 4,
              fontSize: { xs: '1rem', md: '1.15rem' },
              maxWidth: 680,
              mx: 'auto',
            }}
          >
            Busca por disciplina deportiva, recinto o nombre de cancha, selecciona tu rango de fechas preferido en el calendario doble y reserva en tiempo real.
          </Typography>

          {/* Bloque buscador con calendario doble — HU22 */}
          <Paper
            component="form"
            onSubmit={handlePerformSearch}
            elevation={4}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              gap: 1.5,
              maxWidth: 820,
              mx: 'auto',
              boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
              position: 'relative',
            }}
          >
            {/* Campo de búsqueda con sugerencias y autocompletar — HU22 */}
            <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1.4 1 0' }, width: '100%', position: 'relative' }}>
                <TextField
                  id="search-courts-input"
                  fullWidth
                  size="small"
                  placeholder="¿Qué deporte o cancha buscas?"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2, bgcolor: 'background.default' },
                  }}
                />

                {/* Dropdown interactivo de sugerencias y autocompletado — HU22 */}
                {showSuggestions && suggestions.length > 0 && (
                  <Paper
                    elevation={6}
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      mt: 0.5,
                      zIndex: 10,
                      maxHeight: 220,
                      overflowY: 'auto',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    {suggestions.map((sug, idx) => (
                      <Box
                        key={idx}
                        onClick={() => {
                          setSearch(sug);
                          setShowSuggestions(false);
                          setSearchActive(true);
                        }}
                        sx={{
                          p: 1.5,
                          px: 2,
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          borderBottom: idx !== suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                          '&:hover': { bgcolor: 'rgba(30,127,59,0.08)', color: 'success.main' },
                        }}
                      >
                        <SearchIcon fontSize="small" color="disabled" />
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                          {sug}
                        </Typography>
                      </Box>
                    ))}
                  </Paper>
                )}
              </Box>
            </ClickAwayListener>

            {/* Calendario doble: Rango de fechas — HU22 */}
            <Box
              id="search-calendar-range"
              sx={{
                display: 'flex',
                gap: 1,
                width: { xs: '100%', md: 'auto' },
                flex: { xs: '1 1 100%', md: '1.6 1 0' },
              }}
            >
              <TextField
                id="search-date-start"
                type="date"
                size="small"
                label="Desde"
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.default' } }}
              />
              <TextField
                id="search-date-end"
                type="date"
                size="small"
                label="Hasta"
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.default' } }}
              />
            </Box>

            {/* Botón claramente identificable para "Realizar búsqueda" — HU22 */}
            <Button
              id="btn-realizar-busqueda"
              type="submit"
              variant="contained"
              color="success"
              size="medium"
              startIcon={<SearchIcon />}
              sx={{
                width: { xs: '100%', md: 'auto' },
                borderRadius: 2,
                px: 3.5,
                py: 1,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 14px rgba(47,191,113,0.4)',
              }}
            >
              Realizar búsqueda
            </Button>
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -3 }}>
        {/* ═══════════════════════════════════════════════
            CATEGORÍAS DEPORTIVAS — HU20 & Mantenidas en HU22
        ═══════════════════════════════════════════════ */}
        <Box sx={{ mb: 5 }} id="section-categorias">
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
                  '&:hover': { transform: 'translateY(-2px)' },
                }}
              >
                <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: 4 }}>🏟️</span>
                <Typography variant="body2" fontWeight={700}>Todas</Typography>
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
                      '&:hover': { transform: 'translateY(-2px)' },
                    }}
                  >
                    <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: 4 }}>
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
            RECOMENDACIONES — HU2 / Mantenidas en HU22
        ═══════════════════════════════════════════════ */}
        {!loading && recommended.length > 0 && !searchActive && (
          <Box sx={{ mb: 6 }} id="section-recomendaciones">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <StarIcon sx={{ color: '#F59E0B' }} />
              <Typography variant="h5" fontWeight={700} color="primary.main">
                Recomendaciones de la Semana
              </Typography>
              <Chip label="Top destacados" size="small" sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 600 }} />
            </Box>
            <Grid container spacing={3}>
              {recommended.map(court => (
                <Grid item key={`rec-${court.id}`} xs={12} sm={6} md={4}>
                  <RecommendationCard
                    court={court}
                    navigate={navigate}
                    isFavorite={favoriteIds.includes(court.id)}
                    onToggleFavorite={e => handleToggleFavorite(court.id, court.name, e)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* ═══════════════════════════════════════════════
            SECCIÓN DE RESULTADOS DE BÚSQUEDA Y CATÁLOGO
        ═══════════════════════════════════════════════ */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary.main">
              {searchActive ? 'Resultados de la Búsqueda' : 'Canchas Disponibles'}
            </Typography>
            {!loading && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Mostrando <strong>{filteredCourts.length}</strong> {filteredCourts.length === 1 ? 'cancha encontrada' : 'canchas encontradas'}
                {search.trim() && ` para "${search}"`}
                {startDate && endDate && ` entre ${startDate} y ${endDate}`}
                {selectedCategoryIds.length > 0 && ` (${selectedCategoryIds.length} categoría(s) filtrada(s))`}
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
              Restablecer búsqueda y filtros
            </Button>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Grilla de Canchas con Favoritos (HU24) y Puntuación (HU28) */}
        {loading ? (
          <Grid container spacing={3}>
            {[...Array(4)].map((_, i) => (
              <Grid item key={i} xs={12} sm={6}>
                <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {filteredCourts.length > 0 ? filteredCourts.map(court => (
              <Grid item key={court.id} xs={12} sm={6}>
                <CourtCard
                  court={court}
                  navigate={navigate}
                  isFavorite={favoriteIds.includes(court.id)}
                  onToggleFavorite={e => handleToggleFavorite(court.id, court.name, e)}
                />
              </Grid>
            )) : (
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    textAlign: 'center',
                    py: 8,
                    p: 4,
                    borderRadius: 3,
                    border: '1px dashed',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  <SearchIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
                  <Typography variant="h6" fontWeight={700} color="text.primary">
                    No se encontraron canchas para tu búsqueda
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1} maxWidth={460} mx="auto">
                    No hay espacios disponibles que coincidan exactamente con los criterios o fechas seleccionadas. Prueba ajustando el texto o limpiando los filtros.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleClearFilters}
                    sx={{ mt: 3, borderRadius: 2, fontWeight: 700 }}
                  >
                    Ver todas las canchas
                  </Button>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}

        {/* ═══════════════════════════════════════════════
            PAGINACIÓN — HU8
        ═══════════════════════════════════════════════ */}
        {totalPages > 1 && !searchActive && (
          <Box className="pagination-container" sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 1, alignItems: 'center' }}>
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
              onClick={handlePrev}
              disabled={page === 0}
              startIcon={<ArrowBackIosNewIcon />}
              sx={{ borderRadius: 2 }}
            >
              Anterior
            </Button>
            <Chip
              id="pagination-indicator"
              label={`Página ${page + 1} de ${totalPages}`}
              color="primary"
              variant="filled"
              sx={{ fontWeight: 600, px: 1 }}
            />
            <Button
              id="btn-next-page"
              variant="outlined"
              color="primary"
              onClick={handleNext}
              disabled={page >= totalPages - 1}
              endIcon={<ArrowForwardIosIcon />}
              sx={{ borderRadius: 2 }}
            >
              Siguiente
            </Button>
          </Box>
        )}

        <Box sx={{ pb: 6 }} />
      </Container>

      {/* Modal invitación a iniciar sesión para favoritos (HU24) */}
      <Dialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <FavoriteIcon color="error" />
          <Typography variant="h6" fontWeight={700}>Guarda tus favoritos</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Inicia sesión o crea una cuenta gratis para marcar canchas como favoritas con un solo clic y acceder a ellas desde cualquier dispositivo.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setAuthDialogOpen(false)} variant="text" sx={{ borderRadius: 2 }}>
            Ahora no
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => { setAuthDialogOpen(false); navigate('/login'); }}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Iniciar Sesión
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar feedback */}
      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={3000}
        onClose={() => setSnackbarMessage('')}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
}

/* ─── Sub-componentes con Favorito (HU24) y Valoración (HU28) ─── */

function CourtCard({ court, navigate, isFavorite, onToggleFavorite }) {
  const categoryTitle = court.category?.title || (typeof court.category === 'string' ? court.category : 'General');
  const imageUrl = getImageUrl(court.imageUrl) || `https://placehold.co/400x200/0A2540/ffffff?text=${encodeURIComponent(court.name)}`;
  const rating = court.averageRating || 5.0;
  const reviews = court.reviewCount || 0;

  return (
    <Card
      className="court-card"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.25s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 10px 28px rgba(0,0,0,0.1)',
          borderColor: 'primary.light',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={imageUrl}
          alt={court.name}
          sx={{ objectFit: 'cover', cursor: 'pointer' }}
          onClick={() => navigate(`/court/${court.id}`)}
        />

        {/* Botón de Favorito interactivo con un clic — HU24 */}
        <Tooltip title={isFavorite ? "Quitar de favoritos" : "Marcar como favorito"}>
          <IconButton
            id={`btn-favorito-${court.id}`}
            onClick={onToggleFavorite}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 3,
              bgcolor: 'rgba(255,255,255,0.92)',
              color: isFavorite ? 'error.main' : 'text.secondary',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'white',
                transform: 'scale(1.15)',
                color: 'error.main',
              },
            }}
          >
            {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1 }}>
          <Typography
            gutterBottom
            variant="h6"
            component="h2"
            fontWeight={700}
            noWrap
            sx={{ cursor: 'pointer', '&:hover': { color: 'success.main' } }}
            onClick={() => navigate(`/court/${court.id}`)}
          >
            {court.name}
          </Typography>
        </Box>

        {/* HU28: Presentación integral de la puntuación media y total de valoraciones */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
          <Rating value={rating} precision={0.5} readOnly size="small" />
          <Typography variant="body2" fontWeight={700} color="text.primary">
            {rating.toFixed(1)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({reviews} {reviews === 1 ? 'reseña' : 'reseñas'})
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
          <Chip
            label={categoryTitle}
            size="small"
            sx={{ bgcolor: '#E8F5E9', color: '#1E7F3B', fontWeight: 600, textTransform: 'capitalize' }}
          />
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            mb: 2,
          }}
        >
          {court.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: 'text.secondary' }}>
          <GroupIcon fontSize="small" />
          <Typography variant="body2">Capacidad: {court.capacity || 10} personas</Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2.5, pt: 0 }}>
        <Button
          id={`btn-ver-detalles-${court.id}`}
          variant="contained"
          color="success"
          fullWidth
          onClick={() => navigate(`/court/${court.id}`)}
          sx={{ borderRadius: 2, py: 1, fontWeight: 700 }}
        >
          Ver Detalles y Disponibilidad
        </Button>
      </CardActions>
    </Card>
  );
}

function RecommendationCard({ court, navigate, isFavorite, onToggleFavorite }) {
  const categoryTitle = court.category?.title || (typeof court.category === 'string' ? court.category : 'General');
  const imageUrl = getImageUrl(court.imageUrl) || `https://placehold.co/400x160/1E7F3B/ffffff?text=${encodeURIComponent(court.name)}`;
  const rating = court.averageRating || 5.0;

  return (
    <Card
      className="court-card"
      sx={{
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s',
        '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' },
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
          position: 'absolute', top: 10, left: 10,
          bgcolor: '#F59E0B', borderRadius: 1.5, px: 1, py: 0.3,
          display: 'flex', alignItems: 'center', gap: 0.3,
        }}>
          <StarIcon sx={{ fontSize: 14, color: 'white' }} />
          <Typography variant="caption" fontWeight={700} color="white">Top {rating.toFixed(1)}</Typography>
        </Box>

        {/* Botón favorito en recomendación */}
        <IconButton
          size="small"
          onClick={onToggleFavorite}
          sx={{
            position: 'absolute', top: 8, right: 8,
            bgcolor: 'rgba(255,255,255,0.9)',
            color: isFavorite ? 'error.main' : 'text.secondary',
            '&:hover': { bgcolor: 'white', color: 'error.main' },
          }}
        >
          {isFavorite ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
        </IconButton>
      </Box>

      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} noWrap>{court.name}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
          <LocationOnIcon fontSize="small" />
          <Typography variant="body2" textTransform="capitalize">{categoryTitle}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
