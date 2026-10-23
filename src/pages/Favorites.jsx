import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, CardMedia, CardActions,
  Button, Box, Chip, IconButton, Tooltip, Skeleton, Alert, Paper, Snackbar
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import GroupIcon from '@mui/icons-material/Group';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { useNavigate, Link } from 'react-router-dom';
import api, { getImageUrl } from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchFavorites = () => {
    setLoading(true);
    api.get('/favorites')
      .then(res => {
        setFavorites(res.data || []);
      })
      .catch(() => {
        setError('No se pudo cargar tu lista de favoritos. Inicia sesión nuevamente.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (courtId, courtName) => {
    try {
      await api.delete(`/favorites/${courtId}`);
      setFavorites(prev => prev.filter(c => c.id !== courtId));
      setSnackbar(`Cancha "${courtName}" eliminada de tus favoritos`);
    } catch {
      setError('Error al eliminar de favoritos');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Encabezado */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <FavoriteIcon sx={{ color: 'error.main', fontSize: 32 }} />
            <Typography variant="h4" fontWeight={800} color="primary.main">
              Mis Canchas Favoritas
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Consulta y gestiona las canchas deportivas que has guardado para acceder rápidamente
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Explorar catálogo
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <Grid container spacing={3}>
          {[1, 2, 3].map(n => (
            <Grid item xs={12} sm={6} md={4} key={n}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 1 }} />
              <Skeleton height={32} />
              <Skeleton height={20} width="60%" />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Estado vacío — HU25 */}
      {!loading && favorites.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            border: '1px dashed',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            maxWidth: 550,
            mx: 'auto',
            mt: 4,
          }}
        >
          <FavoriteIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom color="text.primary">
            Aún no tienes canchas favoritas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Explora nuestro catálogo deportivo y marca con un clic el ícono de corazón en las canchas que más te gusten.
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="contained"
            color="success"
            size="large"
            sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
          >
            Explorar Canchas
          </Button>
        </Paper>
      )}

      {/* Grilla de Favoritos — HU25 */}
      {!loading && favorites.length > 0 && (
        <Grid container spacing={3}>
          {favorites.map(court => {
            const catTitle = court.category?.title || 'Deporte';
            const img = court.imageUrl
              ? getImageUrl(court.imageUrl)
              : `https://placehold.co/400x250/0A2540/ffffff?text=${encodeURIComponent(court.name)}`;
            const rating = court.averageRating || 5.0;
            const reviews = court.reviewCount || 0;

            return (
              <Grid item xs={12} sm={6} md={4} key={court.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                      borderColor: 'primary.light',
                    },
                  }}
                >
                  {/* Badge de categoría */}
                  <Chip
                    label={catTitle}
                    size="small"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      fontWeight: 700,
                      zIndex: 2,
                    }}
                  />

                  {/* Botón eliminar de favoritos con un clic — HU24 / HU25 */}
                  <Tooltip title="Eliminar de favoritos">
                    <IconButton
                      onClick={() => handleRemoveFavorite(court.id, court.name)}
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 2,
                        bgcolor: 'white',
                        color: 'error.main',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        '&:hover': { bgcolor: 'white', color: 'error.dark', transform: 'scale(1.1)' },
                      }}
                    >
                      <FavoriteIcon />
                    </IconButton>
                  </Tooltip>

                  <CardMedia
                    component="img"
                    height="190"
                    image={img}
                    alt={court.name}
                    sx={{ objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => navigate(`/court/${court.id}`)}
                  />

                  <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                        {court.name}
                      </Typography>
                    </Box>

                    {/* Calificación — HU28 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                      <StarIcon sx={{ color: '#FFB800', fontSize: 18 }} />
                      <Typography variant="body2" fontWeight={700}>
                        {rating.toFixed(1)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({reviews} {reviews === 1 ? 'reseña' : 'reseñas'})
                      </Typography>
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

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                      <GroupIcon fontSize="small" />
                      <Typography variant="caption">Capacidad: {court.capacity || 10} personas</Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      onClick={() => navigate(`/court/${court.id}`)}
                      sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                      Ver Disponibilidad
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Feedback Snackbar */}
      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={3000}
        onClose={() => setSnackbar('')}
        message={snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Container>
  );
}
