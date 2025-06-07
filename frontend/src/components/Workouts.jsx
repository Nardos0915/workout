import { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Delete as DeleteIcon,
  AccessTime,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { format } from 'date-fns';

function Workouts() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

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

  const filteredWorkouts = workouts.filter(workout =>
    (workout.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    workout.exercises?.some(exercise =>
      (exercise.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )
  );

  const sortedWorkouts = [...filteredWorkouts].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          All Workouts
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            label="Search workouts"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortBy}
              label="Sort by"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
            </Select>
          </FormControl>
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
          {sortedWorkouts.map((workout) => (
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
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(workout._id)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon />
                    </IconButton>
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
      </Box>
    </Container>
  );
}

export default Workouts; 