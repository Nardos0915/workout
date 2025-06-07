const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  exercises: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    sets: {
      type: Number,
      required: true,
      min: 1
    },
    reps: {
      type: Number,
      required: true,
      min: 1
    },
    weight: {
      type: Number,
      min: 0
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Workout', workoutSchema); 