const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const auth = require('../middleware/auth');

// Get all workouts for a user
router.get('/', auth, async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ message: 'Error fetching workouts', error: error.message });
  }
});

// Create a new workout
router.post('/', auth, async (req, res) => {
  try {
    const { name, exercises } = req.body;

    // Validate required fields
    if (!name || !exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ message: 'Name and at least one exercise are required' });
    }

    // Validate exercises
    for (const exercise of exercises) {
      if (!exercise.name || !exercise.sets || !exercise.reps) {
        return res.status(400).json({ message: 'Each exercise must have a name, sets, and reps' });
      }
    }

    const workout = new Workout({
      name,
      exercises,
      user: req.user.userId,
      createdAt: new Date()
    });

    await workout.save();
    res.status(201).json(workout);
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(500).json({ message: 'Error creating workout', error: error.message });
  }
});

// Update a workout
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, exercises } = req.body;

    // Validate required fields
    if (!name || !exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ message: 'Name and at least one exercise are required' });
    }

    // Validate exercises
    for (const exercise of exercises) {
      if (!exercise.name || !exercise.sets || !exercise.reps) {
        return res.status(400).json({ message: 'Each exercise must have a name, sets, and reps' });
      }
    }

    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      {
        name,
        exercises,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    res.json(workout);
  } catch (error) {
    console.error('Error updating workout:', error);
    res.status(500).json({ message: 'Error updating workout', error: error.message });
  }
});

// Delete a workout
router.delete('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ message: 'Error deleting workout', error: error.message });
  }
});

module.exports = router; 