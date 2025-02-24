const mongoose = require('mongoose');

const busLocationSchema = new mongoose.Schema({
  busNumber: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const BusLocation = mongoose.model('BusLocation', busLocationSchema);

module.exports = BusLocation;