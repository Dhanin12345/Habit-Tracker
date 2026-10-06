const mongoose = require('mongoose');
const { createModel } = require('../config/db');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  badges: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create model proxy
// modelName = 'User', mongooseSchema = UserSchema, collectionName = 'users', defaultValues = { badges: [] }
const User = createModel('User', UserSchema, 'users', {
  badges: [],
  createdAt: new Date()
});

module.exports = User;
