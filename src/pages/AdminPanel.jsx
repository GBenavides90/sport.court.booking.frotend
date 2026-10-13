import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Button, TextField, Table, TableBody,
  TableCell, TableHead, TableRow, Paper, Alert, Chip, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  Divider, Grid, LinearProgress, Snackbar, Checkbox, FormControlLabel,
  useMediaQuery, useTheme, IconButton, Tooltip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon    from '@mui/icons-material/DeleteOutline';
import EditIcon             from '@mui/icons-material/Edit';
import UploadFileIcon       from '@mui/icons-material/UploadFile';
import SportsTennisIcon     from '@mui/icons-material/SportsTennis';
import ListAltIcon          from '@mui/icons-material/ListAlt';
import HomeIcon             from '@mui/icons-material/Home';
import WarningAmberIcon     from '@mui/icons-material/WarningAmber';
import PhoneAndroidIcon     from '@mui/icons-material/PhoneAndroid';
import CategoryIcon         from '@mui/icons-material/Category';
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList';
import PeopleIcon           from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonOutlineIcon    from '@mui/icons-material/PersonOutline';
import { useNavigate, Link } from 'react-router-dom';
import api, { getImageUrl } from '../api/axiosConfig';
import FeatureIcon from '../components/FeatureIcon';

const ALLOWED_ICONS = [
  'wifi', 'parking', 'shower', 'lockers', 'lighting', 'cafe', 'water',
  'restroom', 'ac', 'tv', 'firstaid', 'security', 'bleachers', 'equipment'
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const theme = useTheme();

  /* HU9: Bloquear panel en pantallas pequeñas */
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [courts, setCourts]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [features, setFeatures]     = useState([]);
  const [users, setUsers]           = useState([]);

  const [loading, setLoading]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  // activeSection: 'register' | 'list' | 'features' | 'categories' | 'users'
  const [activeSection, setActiveSection] = useState('register');

  /* Court form state */
  const [courtForm, setCourtForm] = useState({
    name: '',
    description: '',
    categoryId: '',
    capacity: '',
    featureIds: [],
  });
  const [courtFile, setCourtFile] = useState(null);

  /* Delete court dialog */
  const [deleteTarget, setDeleteTarget] = useState(null);

  /* Feature form state (HU17) */
  const [featureForm, setFeatureForm] = useState({ name: '', icon: 'lighting' });
  const [editingFeature, setEditingFeature] = useState(null);
  const [deleteFeatureTarget, setDeleteFeatureTarget] = useState(null);

  /* Category form state (HU21) */
  const [catForm, setCatForm] = useState({ title: '', description: '' });
  const [catFile, setCatFile] = useState(null);

  /* ── Load initial data ── */
  const fetchCourts = () => {
    setLoading(true);
    api.get('/courts?page=0&size=100')
      .then(res => setCourts(res.data.content || []))
      .catch(() => setError('Error al cargar la lista de canchas'))
      .finally(() => setLoading(false));
  };

  const fetchCategories = () => {
    api.get('/categories')
      .then(res => setCategories(res.data || []))
      .catch(() => setError('Error al cargar las categorías'));
  };

  const fetchFeatures = () => {
    api.get('/features')
      .then(res => setFeatures(res.data || []))
      .catch(() => setError('Error al cargar las características'));
  };

  const fetchUsers = () => {
    api.get('/admin/users')
      .then(res => setUsers(res.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchCourts();
    fetchCategories();
    fetchFeatures();
    fetchUsers();
  }, []);

  /* ── Court Features selection toggle ── */
  const handleFeatureToggle = (featureId) => {
    setCourtForm(prev => {
      const exists = prev.featureIds.includes(featureId);
      return {
        ...prev,
        featureIds: exists
          ? prev.featureIds.filter(id => id !== featureId)
          : [...prev.featureIds, featureId]
      };
    });
  };

  /* ── HU3 / TC-08: Register court ── */
  const handleCreateCourt = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const formData = new FormData();
    formData.append('name', courtForm.name);
    formData.append('description', courtForm.description);
    formData.append('categoryId', courtForm.categoryId);
    formData.append('capacity', courtForm.capacity);
    if (courtFile) formData.append('image', courtFile);

    if (courtForm.featureIds && courtForm.featureIds.length > 0) {
      courtForm.featureIds.forEach(id => formData.append('featureIds', id));
    }

    try {
      await api.post('/courts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchCourts();
      setCourtForm({ name: '', description: '', categoryId: '', capacity: '', featureIds: [] });
      setCourtFile(null);
      setSuccess('✅ Cancha registrada correctamente con su categoría y características');
      setActiveSection('list');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Error al crear la cancha.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete court handlers ── */
  const confirmDeleteCourt = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/courts/${deleteTarget.id}`);
      fetchCourts();
      setSuccess(`🗑️ Cancha "${deleteTarget.name}" eliminada correctamente`);
    } catch {
      setError('Error al eliminar la cancha');
    } finally {
      setDeleteTarget(null);
    }
  };

  /* ── HU17: Create / Edit Feature ── */
  const handleSaveFeature = async (e) => {
    e.preventDefault();
    if (!featureForm.name.trim()) return;
    setSaving(true);
    setError('');

    try {
      if (editingFeature) {
        await api.put(`/features/${editingFeature.id}`, featureForm);
        setSuccess('✅ Característica actualizada correctamente');
      } else {
        await api.post('/features', featureForm);
        setSuccess('✅ Característica creada exitosamente');
      }
      setFeatureForm({ name: '', icon: 'lighting' });
      setEditingFeature(null);
      fetchFeatures();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la característica');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFeature = async () => {
    if (!deleteFeatureTarget) return;
    try {
      await api.delete(`/features/${deleteFeatureTarget.id}`);
      setSuccess(`🗑️ Característica "${deleteFeatureTarget.name}" eliminada`);
      fetchFeatures();
    } catch {
      setError('Error al eliminar la característica');
    } finally {
      setDeleteFeatureTarget(null);
    }
  };

  /* ── HU21: Create Category ── */
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catForm.title.trim()) return;
    setSaving(true);
    setError('');

    const formData = new FormData();
    formData.append('title', catForm.title);
    formData.append('description', catForm.description);
    if (catFile) formData.append('image', catFile);

    try {
      await api.post('/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('✅ Categoría agregada exitosamente');
      setCatForm({ title: '', description: '' });
      setCatFile(null);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la categoría');
    } finally {
      setSaving(false);
    }
  };

  /* ── HU16: Toggle User Role ── */
  const handleToggleUserRole = async (user) => {
    const nextRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await api.put(`/admin/users/${user.id}/role`, { role: nextRole });
      setSuccess(`Rol de ${user.email} actualizado a ${nextRole}`);
      fetchUsers();
    } catch {
      setError('Error al actualizar el rol del usuario');
    }
  };

  /* ── Mobile view block (HU9) ── */
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
          HEADER & MENU DE ADMINISTRACIÓN
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
                Sport Court Booking — Gestión integral del sistema
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

          {/* Menú de pestañas */}
          <Box id="admin-menu" sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap' }}>
            <NavButton
              id="menu-registrar-cancha"
              active={activeSection === 'register'}
              onClick={() => setActiveSection('register')}
              icon={<AddCircleOutlineIcon />}
              label="Registrar Cancha"
            />
            <NavButton
              id="menu-listar-canchas"
              active={activeSection === 'list'}
              onClick={() => setActiveSection('list')}
              icon={<ListAltIcon />}
              label="Listar Canchas"
              badge={courts.length}
            />
            <NavButton
              id="menu-caracteristicas"
              active={activeSection === 'features'}
              onClick={() => setActiveSection('features')}
              icon={<FeaturedPlayListIcon />}
              label="Características"
              badge={features.length}
            />
            <NavButton
              id="menu-categorias"
              active={activeSection === 'categories'}
              onClick={() => setActiveSection('categories')}
              icon={<CategoryIcon />}
              label="Categorías"
              badge={categories.length}
            />
            <NavButton
              id="menu-usuarios"
              active={activeSection === 'users'}
              onClick={() => { setActiveSection('users'); fetchUsers(); }}
              icon={<PeopleIcon />}
              label="Gestión Usuarios"
              badge={users.length}
            />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Notificaciones */}
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {loading && <LinearProgress color="success" sx={{ mb: 3, borderRadius: 1 }} />}

        {/* ════════════════════════════════════════════
            1. REGISTRAR CANCHA (HU3 + HU12 + HU17)
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
                  Asocia la categoría deportiva y las características disponibles
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Box component="form" id="form-registrar-cancha" onSubmit={handleCreateCourt}>
              <Grid container spacing={2.5}>
                {/* Nombre */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="input-nombre-cancha"
                    label="Nombre de la cancha *"
                    required
                    fullWidth
                    value={courtForm.name}
                    onChange={e => setCourtForm({ ...courtForm, name: e.target.value })}
                    placeholder="Ej: Cancha Central Fútbol"
                  />
                </Grid>

                {/* Categoría: utiliza cat.id como valor y cat.title para mostrar */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="input-categoria"
                    label="Categoría deportiva *"
                    required
                    fullWidth
                    select
                    SelectProps={{ native: true }}
                    value={courtForm.categoryId}
                    onChange={e => setCourtForm({ ...courtForm, categoryId: e.target.value })}
                  >
                    <option value="">Selecciona una categoría...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.title}
                      </option>
                    ))}
                  </TextField>
                </Grid>

                {/* Capacidad */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="input-capacidad"
                    label="Capacidad (personas) *"
                    type="number"
                    required
                    fullWidth
                    value={courtForm.capacity}
                    onChange={e => setCourtForm({ ...courtForm, capacity: e.target.value })}
                    inputProps={{ min: 1, max: 500 }}
                  />
                </Grid>

                {/* Imagen */}
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
                      borderColor: courtFile ? 'success.main' : 'divider',
                      color: courtFile ? 'success.main' : 'text.secondary',
                      '&:hover': { borderColor: 'success.main' },
                    }}
                  >
                    {courtFile ? courtFile.name : 'Subir imagen de la cancha'}
                    <input type="file" hidden onChange={e => e.target.files[0] && setCourtFile(e.target.files[0])} accept="image/*" />
                  </Button>
                  {courtFile && (
                    <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
                      ✓ Imagen seleccionada: {Math.round(courtFile.size / 1024)} KB
                    </Typography>
                  )}
                </Grid>

                {/* Descripción */}
                <Grid item xs={12}>
                  <TextField
                    id="input-descripcion"
                    label="Descripción *"
                    required
                    fullWidth
                    multiline
                    rows={3}
                    value={courtForm.description}
                    onChange={e => setCourtForm({ ...courtForm, description: e.target.value })}
                    placeholder="Describe los detalles de la cancha, superficie, ubicación..."
                  />
                </Grid>

                {/* HU17: Selección de Características disponibles */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={700} color="primary.main" gutterBottom>
                    Características disponibles
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Marca los servicios e infraestructura con los que cuenta esta cancha
                  </Typography>

                  {features.length > 0 ? (
                    <Grid container spacing={1.5}>
                      {features.map(feat => {
                        const checked = courtForm.featureIds.includes(feat.id);
                        return (
                          <Grid item xs={12} sm={6} md={4} key={feat.id}>
                            <Paper
                              variant="outlined"
                              onClick={() => handleFeatureToggle(feat.id)}
                              sx={{
                                p: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                borderRadius: 2,
                                borderColor: checked ? 'success.main' : 'divider',
                                bgcolor: checked ? 'rgba(30, 127, 59, 0.08)' : 'background.paper',
                                transition: 'all 0.2s',
                              }}
                            >
                              <Checkbox checked={checked} color="success" sx={{ mr: 1, p: 0.5 }} />
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <FeatureIcon name={feat.icon} fontSize="small" sx={{ color: 'success.main' }} />
                                <Typography variant="body2" fontWeight={checked ? 700 : 500}>
                                  {feat.name}
                                </Typography>
                              </Box>
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      No hay características registradas. Puedes agregarlas en la pestaña <strong>Características</strong>.
                    </Alert>
                  )}
                </Grid>

                {/* Botones de acción */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
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
                      onClick={() => {
                        setCourtForm({ name: '', description: '', categoryId: '', capacity: '', featureIds: [] });
                        setCourtFile(null);
                        setError('');
                      }}
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
            2. LISTAR CANCHAS
        ════════════════════════════════════════════ */}
        {activeSection === 'list' && (
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <SportsTennisIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>Canchas Registradas</Typography>
                <Typography variant="body2" color="text.secondary">
                  {courts.length} cancha(s) en el sistema
                </Typography>
              </Box>
            </Box>

            <Table id="tabla-canchas">
              <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', width: 70 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Categoría</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Características</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Capacidad</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courts.map(court => {
                  const catTitle = court.category?.title || (typeof court.category === 'string' ? court.category : 'Sin categoría');
                  const courtFeatures = Array.isArray(court.features) ? court.features : (court.features ? Array.from(court.features) : []);

                  return (
                    <TableRow key={court.id} id={`row-court-${court.id}`} hover>
                      <TableCell>
                        <Chip label={`#${court.id}`} size="small" sx={{ fontWeight: 600, bgcolor: 'background.default' }} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            src={court.imageUrl ? getImageUrl(court.imageUrl) : undefined}
                            sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.8rem' }}
                          >
                            <SportsTennisIcon fontSize="small" />
                          </Avatar>
                          <Typography fontWeight={600}>{court.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={catTitle}
                          size="small"
                          sx={{ bgcolor: '#E8F5E9', color: '#1E7F3B', fontWeight: 600, textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', maxWidth: 260 }}>
                          {courtFeatures.slice(0, 3).map(f => (
                            <Chip
                              key={f.id}
                              icon={<FeatureIcon name={f.icon} style={{ fontSize: 14 }} />}
                              label={f.name}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          ))}
                          {courtFeatures.length > 3 && (
                            <Chip label={`+${courtFeatures.length - 3}`} size="small" variant="outlined" />
                          )}
                          {courtFeatures.length === 0 && (
                            <Typography variant="caption" color="text.secondary">—</Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography color="text.secondary">{court.capacity} personas</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          id={`btn-eliminar-${court.id}`}
                          startIcon={<DeleteOutlineIcon />}
                          color="error"
                          variant="outlined"
                          size="small"
                          onClick={() => setDeleteTarget(court)}
                          sx={{ borderRadius: 2, fontWeight: 600 }}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {courts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <SportsTennisIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography color="text.secondary" mt={1}>No hay canchas registradas todavía</Typography>
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

        {/* ════════════════════════════════════════════
            3. ADMINISTRAR CARACTERÍSTICAS (HU17)
        ════════════════════════════════════════════ */}
        {activeSection === 'features' && (
          <Grid container spacing={3}>
            {/* Formulario de alta / edición */}
            <Grid item xs={12} md={5}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {editingFeature ? 'Editar Característica' : 'Nueva Característica'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Define el nombre y el ícono asociado para representar un servicio
                </Typography>

                <Box component="form" onSubmit={handleSaveFeature}>
                  <TextField
                    id="input-nombre-caracteristica"
                    label="Nombre de la característica *"
                    fullWidth
                    required
                    value={featureForm.name}
                    onChange={e => setFeatureForm({ ...featureForm, name: e.target.value })}
                    sx={{ mb: 2.5 }}
                    placeholder="Ej: Wi-Fi de alta velocidad"
                  />

                  <TextField
                    id="select-icono-caracteristica"
                    label="Ícono asociado *"
                    fullWidth
                    required
                    select
                    SelectProps={{ native: true }}
                    value={featureForm.icon}
                    onChange={e => setFeatureForm({ ...featureForm, icon: e.target.value })}
                    sx={{ mb: 3 }}
                  >
                    {ALLOWED_ICONS.map(iconKey => (
                      <option key={iconKey} value={iconKey}>
                        {iconKey.toUpperCase()}
                      </option>
                    ))}
                  </TextField>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">Vista previa del ícono:</Typography>
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'success.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FeatureIcon name={featureForm.icon} />
                    </Box>
                    <Typography variant="body2" fontWeight={600} color="text.primary">{featureForm.name || 'Nombre'}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      id="btn-guardar-caracteristica"
                      type="submit"
                      variant="contained"
                      color="success"
                      fullWidth
                      disabled={saving}
                      sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                      {saving ? 'Guardando...' : (editingFeature ? 'Actualizar' : 'Añadir nueva')}
                    </Button>
                    {editingFeature && (
                      <Button
                        variant="outlined"
                        onClick={() => { setEditingFeature(null); setFeatureForm({ name: '', icon: 'lighting' }); }}
                        sx={{ borderRadius: 2 }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Listado de características */}
            <Grid item xs={12} md={7}>
              <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" fontWeight={700}>Listado de Características</Typography>
                </Box>

                <Table size="small">
                  <TableHead sx={{ bgcolor: 'background.default' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Ícono</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Clave</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {features.map(f => (
                      <TableRow key={f.id} hover>
                        <TableCell>
                          <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'rgba(30,127,59,0.1)', color: 'success.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FeatureIcon name={f.icon} fontSize="small" />
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{f.name}</TableCell>
                        <TableCell>
                          <Chip label={f.icon} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => { setEditingFeature(f); setFeatureForm({ name: f.name, icon: f.icon }); }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteFeatureTarget(f)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}

                    {features.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">No hay características registradas.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* ════════════════════════════════════════════
            4. AGREGAR CATEGORÍA (HU21)
        ════════════════════════════════════════════ */}
        {activeSection === 'categories' && (
          <Grid container spacing={3}>
            {/* Formulario */}
            <Grid item xs={12} md={5}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Agregar Categoría
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Registra un nuevo tipo de deporte con título, descripción e imagen representativa
                </Typography>

                <Box component="form" onSubmit={handleCreateCategory}>
                  <TextField
                    id="input-titulo-categoria"
                    label="Título de la categoría *"
                    fullWidth
                    required
                    value={catForm.title}
                    onChange={e => setCatForm({ ...catForm, title: e.target.value })}
                    sx={{ mb: 2.5 }}
                    placeholder="Ej: Pádel Profesional"
                  />

                  <TextField
                    id="input-desc-categoria"
                    label="Descripción *"
                    fullWidth
                    required
                    multiline
                    rows={3}
                    value={catForm.description}
                    onChange={e => setCatForm({ ...catForm, description: e.target.value })}
                    sx={{ mb: 2.5 }}
                    placeholder="Describe los tipos de canchas y deportes incluidos..."
                  />

                  <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    startIcon={<UploadFileIcon />}
                    sx={{
                      height: 56, borderRadius: 2, borderStyle: 'dashed',
                      justifyContent: 'flex-start', pl: 2, mb: 2,
                      borderColor: catFile ? 'success.main' : 'divider',
                      color: catFile ? 'success.main' : 'text.secondary',
                    }}
                  >
                    {catFile ? catFile.name : 'Subir imagen representativa (opcional)'}
                    <input type="file" hidden onChange={e => e.target.files[0] && setCatFile(e.target.files[0])} accept="image/*" />
                  </Button>

                  <Button
                    id="btn-guardar-categoria"
                    type="submit"
                    variant="contained"
                    color="success"
                    fullWidth
                    disabled={saving}
                    sx={{ borderRadius: 2, fontWeight: 700, py: 1.5 }}
                  >
                    {saving ? 'Guardando...' : 'Crear Categoría'}
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Listado de Categorías */}
            <Grid item xs={12} md={7}>
              <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" fontWeight={700}>Categorías Registradas</Typography>
                </Box>

                <Table size="small">
                  <TableHead sx={{ bgcolor: 'background.default' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Título</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Descripción</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categories.map(c => (
                      <TableRow key={c.id} hover>
                        <TableCell>
                          <Chip label={`#${c.id}`} size="small" />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{c.title}</TableCell>
                        <TableCell sx={{ color: 'text.secondary', maxWidth: 300 }}>{c.description}</TableCell>
                      </TableRow>
                    ))}
                    {categories.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">No hay categorías registradas.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* ════════════════════════════════════════════
            5. GESTIÓN DE USUARIOS Y ROLES (HU16)
        ════════════════════════════════════════════ */}
        {activeSection === 'users' && (
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                <PeopleIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>Gestión de Usuarios y Permisos</Typography>
                <Typography variant="body2" color="text.secondary">
                  Otorga o retira el permiso de Administrador para colaborar en la gestión del sitio
                </Typography>
              </Box>
            </Box>

            <Table id="tabla-usuarios">
              <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Usuario</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Correo electrónico</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Rol actual</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Chip label={`#${u.id}`} size="small" />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {u.firstName} {u.lastName}
                    </TableCell>
                    <TableCell color="text.secondary">{u.email}</TableCell>
                    <TableCell>
                      <Chip
                        icon={u.role === 'ADMIN' ? <AdminPanelSettingsIcon /> : <PersonOutlineIcon />}
                        label={u.role}
                        color={u.role === 'ADMIN' ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant={u.role === 'ADMIN' ? 'outlined' : 'contained'}
                        color={u.role === 'ADMIN' ? 'warning' : 'primary'}
                        onClick={() => handleToggleUserRole(u)}
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                      >
                        {u.role === 'ADMIN' ? 'Quitar Admin' : 'Hacer Admin'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No se han cargado usuarios.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Container>

      {/* ── Dialog confirmación eliminar cancha ── */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
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
            ¿Estás seguro de que deseas eliminar la cancha <strong>"{deleteTarget?.name}"</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button
            id="btn-cancelar-eliminacion"
            onClick={() => setDeleteTarget(null)}
            variant="outlined"
            sx={{ borderRadius: 2, fontWeight: 600 }}
          >
            Cancelar
          </Button>
          <Button
            id="btn-confirmar-eliminacion"
            onClick={confirmDeleteCourt}
            variant="contained"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Sí, eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Dialog confirmación eliminar característica ── */}
      <Dialog
        open={Boolean(deleteFeatureTarget)}
        onClose={() => setDeleteFeatureTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WarningAmberIcon color="error" />
          <Typography fontWeight={700}>Eliminar Característica</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Deseas eliminar la característica <strong>"{deleteFeatureTarget?.name}"</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteFeatureTarget(null)} variant="outlined">Cancelar</Button>
          <Button onClick={handleDeleteFeature} variant="contained" color="error">Eliminar</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar feedback */}
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

function NavButton({ id, active, onClick, icon, label, badge }) {
  return (
    <Button
      id={id}
      startIcon={icon}
      onClick={onClick}
      variant={active ? 'contained' : 'text'}
      color="success"
      sx={{
        fontWeight: 700,
        color: active ? 'white' : 'rgba(255,255,255,0.7)',
        bgcolor: active ? 'success.main' : 'transparent',
        '&:hover': { bgcolor: 'rgba(47,191,113,0.15)' },
        borderRadius: 2,
      }}
    >
      {label}
      {typeof badge === 'number' && badge > 0 && (
        <Chip
          label={badge}
          size="small"
          sx={{ ml: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', height: 20, fontSize: '0.7rem' }}
        />
      )}
    </Button>
  );
}
