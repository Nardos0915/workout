import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Box,
  Chip,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Add as AddIcon,
  FitnessCenter as FitnessIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { format } from 'date-fns';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    exercises: [{ name: '', sets: '', reps: '', weight: '' }]
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchWorkouts();
  }, [user, navigate]);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/workouts');
      setWorkouts(response.data);
    } catch (err) {
      console.error('Error fetching workouts:', err);
      setError(err.response?.data?.message || 'Error fetching workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    if (name === 'name') {
      setFormData(prev => ({ ...prev, name: value }));
    } else {
      const newExercises = [...formData.exercises];
      newExercises[index] = { ...newExercises[index], [name]: value };
      setFormData(prev => ({ ...prev, exercises: newExercises }));
    }
  };

  const addExercise = () => {
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, { name: '', sets: '', reps: '', weight: '' }]
    }));
  };

  const removeExercise = (index) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await api.post('/workouts', formData);
      setWorkouts(prev => [response.data, ...prev]);
      setFormData({
        name: '',
        exercises: [{ name: '', sets: '', reps: '', weight: '' }]
      });
      setOpenDialog(false);
    } catch (err) {
      console.error('Error creating workout:', err);
      setError(err.response?.data?.message || 'Error creating workout');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) {
      return;
    }

    try {
      await api.delete(`/workouts/${id}`);
      setWorkouts(prev => prev.filter(workout => workout._id !== id));
    } catch (err) {
      console.error('Error deleting workout:', err);
      setError(err.response?.data?.message || 'Error deleting workout');
    }
  };

  const filteredWorkouts = workouts.filter(workout =>
    workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workout.exercises.some(exercise => 
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Workouts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          Add Workout
        </Button>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search workouts or exercises..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={3}>
        {filteredWorkouts.map(workout => (
          <Grid item xs={12} sm={6} md={4} key={workout._id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {workout.name}
                  </Typography>
                  <Box>
                    <Tooltip title="Edit">
                      <IconButton size="small" sx={{ mr: 1 }}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(workout._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Chip
                  icon={<FitnessIcon />}
                  label={format(new Date(workout.createdAt), 'MMM d, yyyy')}
                  size="small"
                  sx={{ mb: 2 }}
                />

                {workout.exercises.map((exercise, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 1,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'rgba(124, 77, 255, 0.1)',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {exercise.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {exercise.sets} sets × {exercise.reps} reps
                      {exercise.weight && ` @ ${exercise.weight}kg`}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Workout</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Workout Name"
              fullWidth
              name="name"
              value={formData.name}
              onChange={(e) => handleInputChange(e)}
              required
              sx={{ mb: 2 }}
            />

            {formData.exercises.map((exercise, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'rgba(124, 77, 255, 0.05)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1">Exercise {index + 1}</Typography>
                  {index > 0 && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => removeExercise(index)}
                    >
                      Remove
                    </Button>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Exercise Name"
                      fullWidth
                      name="name"
                      value={exercise.name}
                      onChange={(e) => handleInputChange(e, index)}
                      required
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Sets"
                      type="number"
                      fullWidth
                      name="sets"
                      value={exercise.sets}
                      onChange={(e) => handleInputChange(e, index)}
                      required
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Reps"
                      type="number"
                      fullWidth
                      name="reps"
                      value={exercise.reps}
                      onChange={(e) => handleInputChange(e, index)}
                      required
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Weight (kg)"
                      type="number"
                      fullWidth
                      name="weight"
                      value={exercise.weight}
                      onChange={(e) => handleInputChange(e, index)}
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Button
              type="button"
              onClick={addExercise}
              startIcon={<AddIcon />}
              sx={{ mt: 1 }}
            >
              Add Exercise
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!formData.name || formData.exercises.some(ex => !ex.name || !ex.sets || !ex.reps)}
            >
              Create Workout
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Workouts; 