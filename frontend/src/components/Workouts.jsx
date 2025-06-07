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
} from '@mui/material';
import {
  Delete as DeleteIcon,
  AccessTime,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { format } from 'date-fns';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
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
      console.log('Fetching workouts...');
      const response = await api.get('/workouts');
      console.log('Workouts fetched:', response.data);
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

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Workout name is required');
      return false;
    }

    if (formData.exercises.length === 0) {
      setError('At least one exercise is required');
      return false;
    }

    for (const exercise of formData.exercises) {
      if (!exercise.name.trim()) {
        setError('Exercise name is required');
        return false;
      }
      if (!exercise.sets || exercise.sets < 1) {
        setError('Sets must be at least 1');
        return false;
      }
      if (!exercise.reps || exercise.reps < 1) {
        setError('Reps must be at least 1');
        return false;
      }
      if (exercise.weight && exercise.weight < 0) {
        setError('Weight cannot be negative');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      console.log('Creating workout with data:', formData);
      const response = await api.post('/workouts', formData);
      console.log('Workout created:', response.data);
      setWorkouts(prev => [response.data, ...prev]);
      setFormData({
        name: '',
        exercises: [{ name: '', sets: '', reps: '', weight: '' }]
      });
      setShowForm(false);
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
      console.log('Deleting workout:', id);
      await api.delete(`/workouts/${id}`);
      console.log('Workout deleted successfully');
      setWorkouts(prev => prev.filter(workout => workout._id !== id));
    } catch (err) {
      console.error('Error deleting workout:', err);
      setError(err.response?.data?.message || 'Error deleting workout');
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Workouts</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showForm ? 'Cancel' : 'Add Workout'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Workout Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => handleInputChange(e)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter workout name"
            />
          </div>

          {formData.exercises.map((exercise, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Exercise {index + 1}</h3>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeExercise(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Exercise Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={exercise.name}
                    onChange={(e) => handleInputChange(e, index)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Enter exercise name"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Sets
                  </label>
                  <input
                    type="number"
                    name="sets"
                    value={exercise.sets}
                    onChange={(e) => handleInputChange(e, index)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Number of sets"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Reps
                  </label>
                  <input
                    type="number"
                    name="reps"
                    value={exercise.reps}
                    onChange={(e) => handleInputChange(e, index)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Number of reps"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Weight (optional)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={exercise.weight}
                    onChange={(e) => handleInputChange(e, index)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Weight in kg"
                    min="0"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={addExercise}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add Exercise
            </button>

            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save Workout
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workouts.map(workout => (
          <div key={workout._id} className="bg-white shadow-md rounded p-4">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{workout.name}</h2>
              <button
                onClick={() => handleDelete(workout._id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>

            <div className="space-y-2">
              {workout.exercises.map((exercise, index) => (
                <div key={index} className="border-b pb-2">
                  <h3 className="font-semibold">{exercise.name}</h3>
                  <p className="text-gray-600">
                    {exercise.sets} sets × {exercise.reps} reps
                    {exercise.weight ? ` @ ${exercise.weight}kg` : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Workouts; 