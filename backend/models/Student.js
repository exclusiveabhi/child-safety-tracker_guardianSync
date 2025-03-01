const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  studentId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  class: { type: String, required: true },
  route: { type: String, required: true },
  busNumber: { type: String, required: true },
  photo: { type: String, required: true }, // Stored as a base64 data URI, e.g. "data:image/jpeg;base64,..."
  scans: [{
    scanType: { type: String }, // e.g. "pickup_home", "dropoff_school", etc.
    cycle: { type: String },    // "morning" or "evening"
    timestamp: { type: Date, default: Date.now },
    success: { type: Boolean }
  }]
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
