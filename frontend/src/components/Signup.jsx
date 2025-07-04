import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form data
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      // Log the request data
      console.log('Sending signup request with:', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });

      const response = await api.post('/auth/signup', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });

      console.log('Signup response:', response.data);

      const { token, user } = response.data;
      
      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Navigate to dashboard
      navigate('/');
    } catch (error) {
      console.error('Signup error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      setError(error.response?.data?.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
            Sign Up
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              error={!!error}
              helperText={error && formData.name === '' ? 'Name is required' : ''}
              autoComplete="name"
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              error={!!error}
              helperText={error && formData.email === '' ? 'Email is required' : ''}
              autoComplete="email"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              error={!!error}
              helperText={error && formData.password === '' ? 'Password is required' : ''}
              autoComplete="new-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                background: 'linear-gradient(45deg, #7C4DFF 30%, #448AFF 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #6B3FE7 30%, #3B7AE0 90%)',
                },
              }}
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </form>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#7C4DFF', textDecoration: 'none' }}>
              Login
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default Signup; 