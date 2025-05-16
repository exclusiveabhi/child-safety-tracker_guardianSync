const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  route: { type: String, required: true } // New field for route
});

const User = mongoose.model('User', userSchema);

module.exports = User;