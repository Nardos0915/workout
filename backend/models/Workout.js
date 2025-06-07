const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exercise name is required'],
    trim: true
  },
  sets: {
    type: Number,
    required: [true, 'Number of sets is required'],
    min: [1, 'Sets must be at least 1']
  },
  reps: {
    type: Number,
    required: [true, 'Number of reps is required'],
    min: [1, 'Reps must be at least 1']
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative'],
    default: null
  }
});

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  name: {
    type: String,
    required: [true, 'Workout name is required'],
    trim: true
  },
  exercises: {
    type: [exerciseSchema],
    required: [true, 'At least one exercise is required'],
    validate: {
      validator: function(exercises) {
        return exercises && exercises.length > 0;
      },
      message: 'At least one exercise is required'
    }
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
workoutSchema.index({ user: 1, createdAt: -1 });

// Add method to validate exercise data
workoutSchema.methods.validateExercise = function(exercise) {
  if (!exercise.name || !exercise.sets || !exercise.reps) {
    throw new Error('Each exercise must have a name, sets, and reps');
  }
  if (exercise.sets < 1 || exercise.reps < 1) {
    throw new Error('Sets and reps must be at least 1');
  }
  if (exercise.weight !== null && exercise.weight < 0) {
    throw new Error('Weight cannot be negative');
  }
};

// Pre-save middleware to validate exercises
workoutSchema.pre('save', function(next) {
  try {
    if (!this.exercises || this.exercises.length === 0) {
      throw new Error('At least one exercise is required');
    }
    this.exercises.forEach(exercise => this.validateExercise(exercise));
    next();
  } catch (error) {
    next(error);
  }
});

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout; 