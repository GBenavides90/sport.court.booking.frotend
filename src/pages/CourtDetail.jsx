import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Grid, CardMedia, Paper, Divider } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function CourtDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [court, setCourt] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:8080/api/courts/${id}`)
      .then(res => setCourt(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!court) return <Typography sx={{ m: 4 }}>Cargando detalles de la cancha...</Typography>;

  return (
    <Container maxWidth="lg">
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 2 }}>
        Volver al listado
      </Button>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <CardMedia
              component="img"
              height="400"
              image={court.imageUrl ? `http://localhost:8080${court.imageUrl}` : 'https://via.placeholder.com/600x400?text=Cancha'}
              alt={court.name}
              sx={{ borderRadius: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2, overflowX: 'auto' }}>
              {[1, 2, 3, 4].map((i) => (
                 <Box key={i} sx={{ minWidth: 100, height: 80, bgcolor: 'grey.300', borderRadius: 1 }} />
              ))}
            </Box>
            <Button variant="outlined" sx={{ mt: 2 }} fullWidth color="primary">Ver galería completa</Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom color="primary.main">
              {court.name}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Categoría: {court.category} | Capacidad: {court.capacity} personas
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Typography variant="body1" paragraph>
              {court.description}
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Button variant="contained" color="success" size="large" fullWidth sx={{ py: 2, fontSize: '1.2rem' }}>
                Reservar Bloque Horario
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
