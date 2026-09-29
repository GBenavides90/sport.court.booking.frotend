import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Button, TextField, Table, TableBody,
  TableCell, TableHead, TableRow, Paper, Alert, Chip, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  Divider, Grid, LinearProgress, Snackbar,
  useMediaQuery, useTheme
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon    from '@mui/icons-material/DeleteOutline';
import UploadFileIcon       from '@mui/icons-material/UploadFile';
import SportsTennisIcon     from '@mui/icons-material/SportsTennis';
import ListAltIcon          from '@mui/icons-material/ListAlt';
import HomeIcon             from '@mui/icons-material/Home';
import WarningAmberIcon     from '@mui/icons-material/WarningAmber';
import PhoneAndroidIcon     from '@mui/icons-material/PhoneAndroid';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const SPORT_CATEGORIES = ['futbol', 'tenis', 'padel', 'squash', 'basquet'];

export default function AdminPanel() {
  const navigate  = useNavigate();
  const theme     = useTheme();

  /* HU9: Panel no debe ser responsive — bloquear en mobile */
  const isMobile  = useMediaQuery(theme.breakpoints.down('md'));

  const [courts,  setCourts]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  /* Form state */
  const [form, setForm] = useState({ name: '', description: '', category: '', capacity: '' });
  const [file, setFile] = useState(null);

  /* Delete confirmation dialog (TC-29) */
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }

  /* Active admin section */
  const [activeSection, setActiveSection] = useState('register'); // 'register' | 'list'

  /* ── Fetch all courts ── */
  const fetchCourts = () => {
    setLoading(true);
    axios.get(`${API_URL}/api/courts?page=0&size=100`)
      .then(res => setCourts(res.data.content || []))
      .catch(() => setError('Error cargando la lista de canchas'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourts(); }, []);

  /* ── TC-08: Register court with valid data ── */
  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const formData = new FormData();
    formData.append('name',        form.name);
    formData.append('description', form.description);
    formData.append('category',    form.category);
    formData.append('capacity',    form.capacity);
    if (file) formData.append('image', file);

    try {
      await axios.post(`${API_URL}/api/courts`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchCourts();
      setForm({ name: '', description: '', category: '', capacity: '' });
      setFile(null);
      setSuccess('✅ Cancha registrada correctamente');
      setActiveSection('list');
    } catch (err) {
      /* TC-09: Duplicate name shows error message */
      if (err.response?.data) {
        setError(err.response.data);
      } else {
        setError('Error al crear la cancha. Intenta nuevamente.');
      }
    } finally {
      setSaving(false);
    }
  };

  /* ── TC-29: Open delete confirmation ── */
  const openDeleteConfirm = (court) => setDeleteTarget(court);

  /* ── TC-31: Cancel deletion keeps record ── */
  const cancelDelete = () => setDeleteTarget(null);

  /* ── TC-30: Confirm delete removes record from DB ── */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${API_URL}/api/courts/${deleteTarget.id}`);
      fetchCourts();
      setSuccess(`🗑️ Cancha "${deleteTarget.name}" eliminada correctamente`);
    } catch {
      setError('Error al eliminar la cancha');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  /* ── HU9: En mobile mostrar mensaje de no disponible ── */
  if (isMobile) {
    return (
      <Box
        id="admin-mobile-block"
        sx={{
          minHeight: '100vh',
          bgcolor: 'primary.main',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          textAlign: 'center',
        }}
      >
        <PhoneAndroidIcon sx={{ fontSize: 72, color: 'rgba(255,255,255,0.3)', mb: 3 }} />
        <Typography variant="h5" fontWeight={800} color="white" mb={2}>
          Panel no disponible en dispositivo móvil
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.65)', mb: 4, maxWidth: 320 }}>
          El panel de administración está diseñado para uso en computadoras de escritorio.
          Por favor accede desde un dispositivo con pantalla más grande.
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="contained"
          color="success"
          size="large"
          startIcon={<HomeIcon />}
          sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}
        >
          Ir al inicio
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* ════════════════════════════════════════════
          HU9 — Admin header + menu (TC-25 / TC-26)
      ════════════════════════════════════════════ */}
      <Box
        id="admin-header"
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 3,
          px: 2,
          borderBottom: '3px solid',
          borderColor: 'success.main',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                Panel de Administración
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>
                Sport Court Booking — Gestión de canchas deportivas
              </Typography>
            </Box>
            <Button
              component={Link}
              to="/"
              startIcon={<HomeIcon />}
              variant="outlined"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', '&:hover': { borderColor: 'white' } }}
            >
              Ir al inicio
            </Button>
          </Box>

          {/* TC-26: Admin navigation menu */}
          <Box
            id="admin-menu"
            sx={{ display: 'flex', gap: 1, mt: 3 }}
          >
            <Button
              id="menu-registrar-cancha"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => setActiveSection('register')}
              variant={activeSection === 'register' ? 'contained' : 'text'}
              color="success"
              sx={{
                fontWeight: 700,
                color: activeSection === 'register' ? 'white' : 'rgba(255,255,255,0.7)',
                bgcolor: activeSection === 'register' ? 'success.main' : 'transparent',
                '&:hover': { bgcolor: 'rgba(47,191,113,0.15)' },
                borderRadius: 2,
              }}
            >
              Registrar Cancha
            </Button>
            <Button
              id="menu-listar-canchas"
              startIcon={<ListAltIcon />}
              onClick={() => setActiveSection('list')}
              variant={activeSection === 'list' ? 'contained' : 'text'}
              color="success"
              sx={{
                fontWeight: 700,
                color: activeSection === 'list' ? 'white' : 'rgba(255,255,255,0.7)',
                bgcolor: activeSection === 'list' ? 'success.main' : 'transparent',
                '&:hover': { bgcolor: 'rgba(47,191,113,0.15)' },
                borderRadius: 2,
              }}
            >
              Listar Canchas
              {courts.length > 0 && (
                <Chip
                  label={courts.length}
                  size="small"
                  sx={{ ml: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', height: 20, fontSize: '0.7rem' }}
                />
              )}
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Alerts */}
        {error   && <Alert severity="error"   sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {loading && <LinearProgress color="success" sx={{ mb: 3, borderRadius: 1 }} />}

        {/* ════════════════════════════════════════════
            HU3 — REGISTER COURT FORM (TC-08/09/10)
        ════════════════════════════════════════════ */}
        {activeSection === 'register' && (
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <AddCircleOutlineIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>Registrar Nueva Cancha</Typography>
                <Typography variant="body2" color="text.secondary">
                  Completa los campos para agregar una cancha al catálogo
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Box component="form" id="form-registrar-cancha" onSubmit={handleCreate}>
              <Grid container spacing={2.5}>
                {/* TC-08: Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="input-nombre-cancha"
                    label="Nombre de la cancha *"
                    required
                    fullWidth
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Ej: Cancha Central Fútbol"
                  />
                </Grid>

                {/* Category */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="input-categoria"
                    label="Categoría deportiva *"
                    required
                    fullWidth
                    select
                    SelectProps={{ native: true }}
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="">Selecciona una categoría...</option>
                    {SPORT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </TextField>
                </Grid>

                {/* Capacity */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="input-capacidad"
                    label="Capacidad (personas) *"
                    type="number"
                    required
                    fullWidth
                    value={form.capacity}
                    onChange={e => setForm({ ...form, capacity: e.target.value })}
                    inputProps={{ min: 1, max: 500 }}
                  />
                </Grid>

                {/* TC-10: Image upload */}
                <Grid item xs={12} sm={6}>
                  <Button
                    id="btn-upload-imagen"
                    component="label"
                    variant="outlined"
                    fullWidth
                    startIcon={<UploadFileIcon />}
                    sx={{
                      height: 56, borderRadius: 2, borderStyle: 'dashed',
                      justifyContent: 'flex-start', pl: 2,
                      borderColor: file ? 'success.main' : 'divider',
                      color: file ? 'success.main' : 'text.secondary',
                      '&:hover': { borderColor: 'success.main' },
                    }}
                  >
                    {file ? file.name : 'Subir imagen de la cancha'}
                    <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                  </Button>
                  {file && (
                    <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
                      ✓ Imagen seleccionada: {Math.round(file.size / 1024)} KB
                    </Typography>
                  )}
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    id="input-descripcion"
                    label="Descripción *"
                    required
                    fullWidth
                    multiline
                    rows={3}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe las características de la cancha, servicios incluidos, ubicación..."
                  />
                </Grid>

                {/* Submit */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      id="btn-guardar-cancha"
                      type="submit"
                      variant="contained"
                      color="success"
                      size="large"
                      disabled={saving}
                      sx={{ px: 4, borderRadius: 2, fontWeight: 700 }}
                    >
                      {saving ? 'Guardando...' : 'Guardar Cancha'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => { setForm({ name: '', description: '', category: '', capacity: '' }); setFile(null); setError(''); }}
                      sx={{ borderRadius: 2 }}
                    >
                      Limpiar
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        )}

        {/* ════════════════════════════════════════════
            HU10 — COURTS LIST (TC-27 / TC-28)
        ════════════════════════════════════════════ */}
        {activeSection === 'list' && (
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <ListAltIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>Canchas Registradas</Typography>
                <Typography variant="body2" color="text.secondary">
                  {courts.length} cancha(s) en el sistema
                </Typography>
              </Box>
            </Box>

            {/* TC-27: Table with ID and name — TC-28: data visible */}
            <Table id="tabla-canchas">
              <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', width: 80 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Categoría</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Capacidad</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courts.map(court => (
                  <TableRow
                    key={court.id}
                    id={`row-court-${court.id}`}
                    hover
                    sx={{ '&:last-child td': { border: 0 } }}
                  >
                    {/* TC-27: ID column */}
                    <TableCell>
                      <Chip label={`#${court.id}`} size="small" sx={{ fontWeight: 600, bgcolor: 'background.default' }} />
                    </TableCell>
                    {/* TC-27: Name column */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={court.imageUrl ? `${API_URL}${court.imageUrl}` : undefined}
                          sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.8rem' }}
                        >
                          <SportsTennisIcon fontSize="small" />
                        </Avatar>
                        <Typography fontWeight={600}>{court.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={court.category}
                        size="small"
                        sx={{ bgcolor: '#E8F5E9', color: '#1E7F3B', fontWeight: 600, textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography color="text.secondary">{court.capacity} personas</Typography>
                    </TableCell>
                    <TableCell align="right">
                      {/* TC-29: Opens confirmation before delete */}
                      <Button
                        id={`btn-eliminar-${court.id}`}
                        startIcon={<DeleteOutlineIcon />}
                        color="error"
                        variant="outlined"
                        size="small"
                        onClick={() => openDeleteConfirm(court)}
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {courts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <SportsTennisIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography color="text.secondary" mt={1}>
                        No hay canchas registradas todavía
                      </Typography>
                      <Button
                        variant="outlined"
                        color="success"
                        sx={{ mt: 2, borderRadius: 2 }}
                        onClick={() => setActiveSection('register')}
                      >
                        Registrar primera cancha
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Container>

      {/* ════════════════════════════════════════════
          TC-29: Delete confirmation dialog
          TC-30: Confirm → delete from DB
          TC-31: Cancel → keeps record
      ════════════════════════════════════════════ */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={cancelDelete}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <WarningAmberIcon color="error" />
          <Typography fontWeight={700} component="span">Confirmar eliminación</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-confirm-message">
            ¿Estás seguro de que deseas eliminar la cancha{' '}
            <strong>"{deleteTarget?.name}"</strong>?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          {/* TC-31: Cancel */}
          <Button
            id="btn-cancelar-eliminacion"
            onClick={cancelDelete}
            variant="outlined"
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Cancelar
          </Button>
          {/* TC-30: Confirm delete */}
          <Button
            id="btn-confirmar-eliminacion"
            onClick={confirmDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Sí, eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success snackbar */}
      <Snackbar
        open={Boolean(success)}
        autoHideDuration={4000}
        onClose={() => setSuccess('')}
        message={success}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
}
