import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  AccessTime,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { format } from 'date-fns';

function Dashboard() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    exercises: [{ name: '', sets: '', reps: '', weight: '' }],
  });

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/workouts');
      setWorkouts(response.data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setError(error.response?.data?.message || 'Failed to fetch workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setFormData({
      name: '',
      exercises: [{ name: '', sets: '', reps: '', weight: '' }],
    });
    setEditingWorkout(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError('');
  };

  const handleExerciseChange = (index, field, value) => {
    const newExercises = [...formData.exercises];
    newExercises[index] = {
      ...newExercises[index],
      [field]: value,
    };
    setFormData({ ...formData, exercises: newExercises });
  };

  const addExercise = () => {
    setFormData({
      ...formData,
      exercises: [...formData.exercises, { name: '', sets: '', reps: '', weight: '' }],
    });
  };

  const removeExercise = (index) => {
    const newExercises = formData.exercises.filter((_, i) => i !== index);
    setFormData({ ...formData, exercises: newExercises });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const workoutData = {
        name: formData.name,
        exercises: formData.exercises.map(exercise => ({
          name: exercise.name,
          sets: parseInt(exercise.sets),
          reps: parseInt(exercise.reps),
          weight: exercise.weight ? parseFloat(exercise.weight) : undefined
        }))
      };

      if (editingWorkout) {
        await api.put(`/workouts/${editingWorkout._id}`, workoutData);
      } else {
        await api.post('/workouts', workoutData);
      }

      await fetchWorkouts();
      handleClose();
    } catch (error) {
      console.error('Error saving workout:', error);
      setError(error.response?.data?.message || 'Failed to save workout');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (workout) => {
    setEditingWorkout(workout);
    setFormData({
      name: workout.name,
      exercises: workout.exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets.toString(),
        reps: ex.reps.toString(),
        weight: ex.weight ? ex.weight.toString() : '',
      })),
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        setLoading(true);
        await api.delete(`/workouts/${id}`);
        await fetchWorkouts();
      } catch (error) {
        console.error('Error deleting workout:', error);
        setError(error.response?.data?.message || 'Failed to delete workout');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Workouts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          sx={{
            background: 'linear-gradient(45deg, #7C4DFF 30%, #B47CFF 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #6B3FE7 30%, #A36BFF 90%)',
            },
          }}
        >
          Create Workout
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={3}>
        {workouts.map((workout) => (
          <Grid
            key={workout._id}
            xs={12}
            sm={6}
            md={4}
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  transition: 'transform 0.2s ease-in-out',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                    {workout.name}
                  </Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(workout)}
                      sx={{ color: 'primary.main' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(workout._id)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Chip
                  icon={<AccessTime />}
                  label={format(new Date(workout.createdAt), 'MMM d, yyyy h:mm a')}
                  size="small"
                  sx={{ mb: 2, bgcolor: 'rgba(124, 77, 255, 0.1)' }}
                />

                {workout.exercises.map((exercise, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 1,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
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

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingWorkout ? 'Edit Workout' : 'Create New Workout'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Workout Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2">Exercise {index + 1}</Typography>
                  {index > 0 && (
                    <IconButton
                      size="small"
                      onClick={() => removeExercise(index)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Exercise Name"
                      fullWidth
                      value={exercise.name}
                      onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Sets"
                      type="number"
                      fullWidth
                      value={exercise.sets}
                      onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                      required
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Reps"
                      type="number"
                      fullWidth
                      value={exercise.reps}
                      onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                      required
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Weight (kg)"
                      type="number"
                      fullWidth
                      value={exercise.weight}
                      onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                      inputProps={{ min: 0, step: 0.5 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={addExercise}
              sx={{ mt: 1 }}
            >
              Add Exercise
            </Button>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                background: 'linear-gradient(45deg, #7C4DFF 30%, #B47CFF 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #6B3FE7 30%, #A36BFF 90%)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Workout'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}

export default Dashboard; 