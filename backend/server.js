const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const nodemailer = require('nodemailer');
const path = require('path');
const port = 3000;

app.use(morgan('dev'));
app.use(cors());
require('dotenv').config();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// ----------------- MONGODB CONNECTION -----------------
async function initializeDatabase() {
  try {
    await mongoose.connect(
      `mongodb+srv://exclusiveabhi:maCdjaRpoWvGczS5@cluster0.b2bxd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
}

// ----------------- NODemailer CONFIGURATION -----------------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// API to send email
app.post('/send-email', async (req, res) => {
  const { email, subject, text } = req.body;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    text: text
  };
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending email');
  }
});

// ----------------- MODELS -----------------
// User Schema for driver
const userSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  route: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Bus location Schema
const locationSchema = new mongoose.Schema({
  busNumber: String,
  latitude: Number,
  longitude: Number,
  timestamp: { type: Date, default: Date.now }
});
const Location = mongoose.model('Location', locationSchema);

// Student Schema – note the new field "faceDescriptor" for caching
const studentSchema = new mongoose.Schema({
  name: String,
  number: String,
  studentId: String,
  email: String,
  class: String,
  route: String,
  busNumber: String,
  photo: String,
  scans: [{ scanType: String, cycle: String, timestamp: Date, success: Boolean }],
  faceDescriptor: { type: [Number] }
});
const Student = mongoose.model('Student', studentSchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});
const Admin = mongoose.model('Admin', adminSchema);

// ----------------- END MODELS -----------------

// ----------------- FACE RECOGNITION SETUP -----------------
const faceapi = require('face-api.js');
const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
const MODEL_URL = path.join(__dirname, '/face-models');

async function loadFaceModels() {
  try {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
    console.log("Face-api models loaded");
  } catch (err) {
    console.error("Error loading face-api models:", err);
    throw err;
  }
}

// Global in-memory cache for student descriptors
const studentDescriptorsCache = {};

// Preload all student descriptors into the cache
async function preloadStudentDescriptors() {
  try {
    const students = await Student.find({});
    for (const student of students) {
      // Compute descriptor if not already stored
      if (!student.faceDescriptor) {
        try {
          const studentImg = await canvas.loadImage(student.photo);
          const detection = await faceapi.detectSingleFace(studentImg)
            .withFaceLandmarks()
            .withFaceDescriptor();
          if (detection) {
            student.faceDescriptor = detection.descriptor;
            await student.save();
          }
        } catch (err) {
          console.error(`Error computing descriptor for ${student.studentId}:`, err);
          continue;
        }
      }
      if (student.faceDescriptor) {
        studentDescriptorsCache[student.studentId] = {
          descriptor: student.faceDescriptor,
          student: student
        };
      }
    }
    console.log('Student descriptors preloaded:', Object.keys(studentDescriptorsCache).length);
  } catch (err) {
    console.error('Error preloading student descriptors:', err);
  }
}

// ----------------- END FACE RECOGNITION SETUP -----------------

// ----------------- AUTHENTICATION ENDPOINTS -----------------
// API to register driver
app.post('/register', async (req, res) => {
  const { busNumber, password, route } = req.body;
  if (!busNumber || !password || !route) {
    return res.status(400).json({ message: 'Bus number, password and route are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ busNumber, password: hashedPassword, route });
    await newUser.save();
    console.log('User registered:', newUser);
    res.status(200).send('User registered successfully');
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).send('Error registering user');
  }
});

// API to login driver
app.post('/login', async (req, res) => {
  const { busNumber, password } = req.body;
  try {
    const user = await User.findOne({ busNumber });
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ bus: user.busNumber }, 'secret_key');
      res.json({ token, routeDetails: user.route });
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).send('Error logging in user');
  }
});
// ----------------- END AUTHENTICATION -----------------

// ----------------- UPDATE LOCATION ENDPOINT -----------------
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (token) {
    jwt.verify(token.split(' ')[1], 'secret_key', (err, decoded) => {
      if (err) {
        return res.status(401).send('Invalid token');
      } else {
        console.log('Decoded token:', decoded);
        req.busNumber = decoded.bus;
        next();
      }
    });
  } else {
    res.status(401).send('No token provided');
  }
};

app.post('/update-location', authenticate, async (req, res) => {
  const { latitude, longitude } = req.body;
  try {
    let busLocation = await Location.findOne({ busNumber: req.busNumber });
    if (busLocation) {
      busLocation.latitude = latitude;
      busLocation.longitude = longitude;
      await busLocation.save();
      res.json({ message: 'Location updated' });
    } else {
      busLocation = new Location({ busNumber: req.busNumber, latitude, longitude });
      await busLocation.save();
      res.json({ message: 'Location created', locationId: busLocation._id });
    }
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).send('Error updating location');
  }
});

app.get('/bus-location/:busNumber', async (req, res) => {
  const { busNumber } = req.params;
  const busLocation = await Location.findOne({ busNumber }).sort({ timestamp: -1 });
  res.json(busLocation);
});

app.get('/students/:busNumber', async (req, res) => {
  const { busNumber } = req.params;
  console.log(`Fetching students for bus number: ${busNumber}`);
  try {
    const students = await Student.find({ busNumber });
    console.log('Fetched students:', students);
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).send('Error fetching students');
  }});

// ----------------- SCAN FACE ENDPOINT -----------------
app.post('/scan-face', async (req, res) => {
  const { busNumber, scanType, scannedFace } = req.body;
  
  if (!busNumber || !scanType || !scannedFace) {
    return res.status(400).json({ message: 'Missing parameters' });
  }
  
  try {
    // Filter cached students for this bus
    const cachedStudents = Object.values(studentDescriptorsCache)
      .filter(entry => entry.student.busNumber === busNumber);
    
    if (!cachedStudents || cachedStudents.length === 0) {
      return res.status(404).json({ message: 'No students found for this bus' });
    }
    
    let cycle = "";
    if (scanType === "pickup_home" || scanType === "dropoff_school") {
      cycle = "morning";
    } else if (scanType === "pickup_school" || scanType === "dropoff_home") {
      cycle = "evening";
    } else {
      return res.status(400).json({ message: 'Invalid scanType' });
    }
    
    const twentyHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000);
    
    const scannedImg = await canvas.loadImage(scannedFace);
    const scannedDetection = await faceapi.detectSingleFace(scannedImg)
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (!scannedDetection) {
      return res.status(400).json({ message: 'No face detected in scanned image' });
    }
    const scannedDescriptor = scannedDetection.descriptor;
    
    let bestMatch = null;
    let bestDistance = Infinity;
    
    for (const entry of cachedStudents) {
      const distance = faceapi.euclideanDistance(scannedDescriptor, entry.descriptor);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestMatch = entry.student;
      }
    }
    
    if (!bestMatch || bestDistance > 0.6) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    bestMatch.scans = bestMatch.scans.filter(event => event.timestamp > twentyHoursAgo);
    const existingEvent = bestMatch.scans.find(event => event.scanType === scanType);
    if (existingEvent) {
      return res.status(400).json({ message: 'Scan already recorded for this scan type' });
    }
    
    let isPickup = (scanType === "pickup_home" || scanType === "pickup_school");
    let isDropoff = (scanType === "dropoff_school" || scanType === "dropoff_home");
    let success;
    if (isPickup) {
      success = true;
    } else if (isDropoff) {
      const expectedPickupType = (cycle === "morning") ? "pickup_home" : "pickup_school";
      const pickupEvent = bestMatch.scans.find(event => event.scanType === expectedPickupType && event.cycle === cycle);
      success = !!pickupEvent;
    }
    
    if (isDropoff && !success) {
      return res.status(400).json({ message: 'Student not properly picked up earlier; cannot drop off.' });
    }
    
    const eventRecord = {
      scanType,
      cycle,
      timestamp: new Date(),
      success: success,
    };
    bestMatch.scans.push(eventRecord);
    await bestMatch.save();
    
    let subject = '';
    let text = '';
    if (isPickup) {
      subject = `Pickup Successful: ${bestMatch.name}`;
      text = `Student ${bestMatch.name} (ID: ${bestMatch.studentId}) was successfully picked up at ${new Date().toLocaleTimeString()} on bus ${busNumber}.`;
    } else if (isDropoff) {
      subject = `Drop-off Successful: ${bestMatch.name}`;
      text = `Student ${bestMatch.name} (ID: ${bestMatch.studentId}) was successfully dropped off at ${new Date().toLocaleTimeString()} on bus ${busNumber}.`;
    }
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: bestMatch.email,
      subject,
      text,
    });
    
    return res.json({ message: `Scan processed successfully: ${isPickup ? 'Pickup' : 'Drop-off'} confirmed, email sent.` });
  } catch (error) {
    console.error('Error processing face scan:', error);
    return res.status(500).json({ message: 'Error processing face scan' });
  }
});
// ----------------- END SCAN FACE -----------------

// ----------------- INITIALIZATION & GRACEFUL SHUTDOWN -----------------
async function initializeServer() {
  try {
    await initializeDatabase();
    await loadFaceModels();
    await preloadStudentDescriptors();
    const server = app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log('Shutting down server...');
      server.close(() => {
        console.log('HTTP server closed.');
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed.');
          process.exit(0);
        });
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error("Initialization error:", err);
  }
}

initializeServer();
