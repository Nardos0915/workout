const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const auth = require('../middleware/auth');

// Get all workouts for a user
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching workouts for user:', req.user.id);
    const workouts = await Workout.find({ user: req.user.id }).sort({ createdAt: -1 });
    console.log(`Found ${workouts.length} workouts`);
    res.json(workouts);
  } catch (err) {
    console.error('Error fetching workouts:', err);
    res.status(500).json({ message: 'Error fetching workouts' });
  }
});

// Create a new workout
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating workout for user:', req.user.id);
    console.log('Workout data:', req.body);

    const { name, exercises } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Workout name is required' });
    }

    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ message: 'At least one exercise is required' });
    }

    // Create new workout
    const workout = new Workout({
      user: req.user.id,
      name,
      exercises: exercises.map(exercise => ({
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight || null
      }))
    });

    // Save workout
    const savedWorkout = await workout.save();
    console.log('Workout created successfully:', savedWorkout._id);
    res.status(201).json(savedWorkout);
  } catch (err) {
    console.error('Error creating workout:', err);
    res.status(500).json({ 
      message: 'Error creating workout',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Update a workout
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Updating workout:', req.params.id);
    console.log('Update data:', req.body);

    const { name, exercises } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Workout name is required' });
    }

    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ message: 'At least one exercise is required' });
    }

    // Find and update workout
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      {
        name,
        exercises: exercises.map(exercise => ({
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight || null
        }))
      },
      { new: true }
    );

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    console.log('Workout updated successfully:', workout._id);
    res.json(workout);
  } catch (err) {
    console.error('Error updating workout:', err);
    res.status(500).json({ 
      message: 'Error updating workout',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Delete a workout
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Deleting workout:', req.params.id);
    const workout = await Workout.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    console.log('Workout deleted successfully:', req.params.id);
    res.json({ message: 'Workout deleted' });
  } catch (err) {
    console.error('Error deleting workout:', err);
    res.status(500).json({ 
      message: 'Error deleting workout',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router; 