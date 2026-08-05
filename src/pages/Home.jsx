import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, CardActions, Button, TextField, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Home() {
  const [courts, setCourts] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios.get(`${API_URL}/api/courts?page=0&size=10`)
      .then(res => setCourts(res.data.content || []))
      .catch(err => console.error(err));
  }, [API_URL]);

  const filteredCourts = courts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="primary.main">
          Reserva tu cancha ideal
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={4}>
          Encuentra los mejores espacios deportivos en la ciudad
        </Typography>
        <TextField
          variant="outlined"
          placeholder="Buscar cancha por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: '100%', maxWidth: 500, bgcolor: 'background.paper' }}
        />
      </Box>

      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Canchas Disponibles</Typography>
      <Grid container spacing={4}>
        {filteredCourts.map(court => (
          <Grid item key={court.id} xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
              <CardMedia
                component="img"
                height="200"
                image={court.imageUrl ? `${API_URL}${court.imageUrl}` : `https://placehold.co/400x200?text=${encodeURIComponent(court.name)}`}
                alt={court.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2" fontWeight="bold">
                  {court.name}
                </Typography>
                <Typography color="text.secondary" noWrap>
                  Categoría: {court.category} | Capacidad: {court.capacity}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" variant="contained" color="secondary" fullWidth onClick={() => navigate(`/court/${court.id}`)}>
                  Ver Detalles
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
