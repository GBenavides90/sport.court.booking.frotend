import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, TextField, Table, TableBody, TableCell, TableHead, TableRow, Paper, Alert } from '@mui/material';
import axios from 'axios';

export default function AdminPanel() {
  const [courts, setCourts] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', category: '', capacity: '' });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = () => {
    axios.get('http://localhost:8080/api/courts?page=0&size=100')
      .then(res => setCourts(res.data.content || []))
      .catch(err => console.error(err));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('category', form.category);
    formData.append('capacity', form.capacity);
    if (file) formData.append('image', file);

    try {
      await axios.post('http://localhost:8080/api/courts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchCourts();
      setForm({ name: '', description: '', category: '', capacity: '' });
      setFile(null);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError('Error creando cancha');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta cancha?')) {
      try {
        await axios.delete(`http://localhost:8080/api/courts/${id}`);
        fetchCourts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary.main">
        Panel de Administración
      </Typography>

      <Box component={Paper} p={3} mb={5} elevation={3}>
        <Typography variant="h6" gutterBottom>Registrar Nueva Cancha</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleCreate} sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          <TextField label="Nombre (*)" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} fullWidth />
          <TextField label="Categoría (*)" required value={form.category} onChange={e => setForm({...form, category: e.target.value})} fullWidth />
          <TextField label="Capacidad (*)" type="number" required value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} fullWidth />
          <Button variant="outlined" component="label" fullWidth sx={{ height: '56px' }}>
            {file ? file.name : "Subir Imagen"}
            <input type="file" hidden onChange={e => setFile(e.target.files[0])} accept="image/*" />
          </Button>
          <TextField label="Descripción (*)" multiline rows={3} required value={form.description} onChange={e => setForm({...form, description: e.target.value})} fullWidth sx={{ gridColumn: '1 / -1' }} />
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Button type="submit" variant="contained" color="primary" size="large">Guardar Cancha</Button>
          </Box>
        </Box>
      </Box>

      <Box component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Nombre</b></TableCell>
              <TableCell><b>Categoría</b></TableCell>
              <TableCell align="right"><b>Acciones</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courts.map(court => (
              <TableRow key={court.id} hover>
                <TableCell>{court.id}</TableCell>
                <TableCell>{court.name}</TableCell>
                <TableCell>{court.category}</TableCell>
                <TableCell align="right">
                  <Button color="error" variant="contained" onClick={() => handleDelete(court.id)}>Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
            {courts.length === 0 && (
              <TableRow><TableCell colSpan={4} align="center">No hay canchas registradas.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Container>
  );
}
