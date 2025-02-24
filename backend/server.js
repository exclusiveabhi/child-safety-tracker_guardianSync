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

// Assume Student and Admin models are defined in separate files in "./models" folder
// For example, require them as needed:
const Student = require('./models/Student');
const Admin = require('./models/Admin');

// ----------------- END MODELS -----------------

// Get bus location by bus number
app.get('/bus-location/:busNumber', async (req, res) => {
  const { busNumber } = req.params;
  try {
    const busLocation = await Location.findOne({ busNumber }).sort({ timestamp: -1 });
    if (busLocation) {
      res.json(busLocation);
    } else {
      res.status(404).send({ message: 'Bus not found' });
    }
  } catch (err) {
    console.error('Error fetching bus location:', err);
    res.status(500).send('Error fetching bus location');
  }
});

// API to get students by bus number
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
  }
});

// API to get students by route
app.get('/students/:route', async (req, res) => {
  console.log("hello");
  const { route } = req.params;
  try {
    const students = await Student.find({ route });
    console.log('Fetched students:', students);
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).send('Error fetching students');
  }
});

// API to register admin
app.post('/admin/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ name, email, password: hashedPassword });
    await newAdmin.save();
    res.status(200).send('Admin registered successfully');
  } catch (err) {
    console.error('Error registering admin:', err);
    res.status(500).send('Error registering admin');
  }
});

// API to login admin
app.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (admin && await bcrypt.compare(password, admin.password)) {
      const token = jwt.sign({ email: admin.email }, 'secret_key');
      res.json({ token });
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).send('Error logging in admin');
  }
});

// API to register student
app.post('/student/register', async (req, res) => {
  console.log("hello student");
  const { name, number, studentId, email, class: studentClass, route, busNumber, photo } = req.body;
  console.log('Received data:', { name, number, studentId, email, studentClass, route, busNumber, photo });
  
  if (!name || !number || !studentId || !email || !studentClass || !route || !busNumber || !photo) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  try {
    const newStudent = new Student({ name, number, studentId, email, class: studentClass, route, busNumber, photo });
    await newStudent.save();
    console.log('Student registered:', newStudent);
    res.status(200).send('Student registered successfully');
  } catch (err) {
    if (err.code === 11000) {
      console.error('Duplicate entry error:', err);
      res.status(400).send('Student with this ID already exists');
    } else {
      console.error('Error registering student:', err);
      res.status(500).send('Error registering student');
    }
  }
});

// API to register driver
app.post('/register', async (req, res) => {
  console.log("hello");
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

// ----------------- FACE RECOGNITION SETUP -----------------
const faceapi = require('face-api.js');
const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
const MODEL_URL = path.join(__dirname, '/face-models'); // face models stored here

// Load face-api models after MongoDB connection is established
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

// ----------------- END FACE RECOGNITION SETUP -----------------

// Updated face matching function using raw Euclidean distance
const matchFaceAsync = async (scanned, stored) => {
  try {
    const scannedImage = await canvas.loadImage(scanned);
    const storedImage = await canvas.loadImage(stored);
    const scannedDetection = await faceapi.detectSingleFace(scannedImage)
      .withFaceLandmarks()
      .withFaceDescriptor();
    const storedDetection = await faceapi.detectSingleFace(storedImage)
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (!scannedDetection || !storedDetection) {
      console.log("Face not detected in one of the images");
      return Infinity; // if a face is not detected, return a very high distance
    }
    const distance = faceapi.euclideanDistance(
      scannedDetection.descriptor,
      storedDetection.descriptor
    );
    console.log(`Calculated distance: ${distance}`);
    return distance;
  } catch (err) {
    console.error("Error in face matching:", err);
    return Infinity;
  }
};

// Updated /scan-face endpoint
app.post('/scan-face', async (req, res) => {
  const { busNumber, scanType, scannedFace } = req.body;
  
  if (!busNumber || !scanType || !scannedFace) {
    return res.status(400).json({ message: 'Missing parameters' });
  }
  
  try {
    const students = await Student.find({ busNumber });
    if (!students || students.length === 0) {
      return res.status(404).json({ message: 'No students found for this bus' });
    }
    
    // Determine the scan cycle based on scanType
    let cycle = "";
    if (scanType === "pickup_home" || scanType === "dropoff_school") {
      cycle = "morning";
    } else if (scanType === "pickup_school" || scanType === "dropoff_home") {
      cycle = "evening";
    } else {
      return res.status(400).json({ message: 'Invalid scanType' });
    }
    
    // Only consider scans from the last 20 hours
    const twentyHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000);
    
    // (Optional) Absent check for morning drop-off can remain here if needed.
    
    // Loop through students to find the best matching face (lowest distance)
    let bestMatch = null;
    let bestDistance = Infinity;
    for (const student of students) {
      const distance = await matchFaceAsync(scannedFace, student.photo);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestMatch = student;
      }
    }
    
    // Use a raw Euclidean distance threshold (e.g. 0.6)
    if (!bestMatch || bestDistance > 0.6) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check to prevent duplicate scans for the same scanType
    bestMatch.scans = bestMatch.scans.filter(event => event.timestamp > twentyHoursAgo);
    const existingEvent = bestMatch.scans.find(event => event.scanType === scanType);
    if (existingEvent) {
      return res.status(400).json({ message: 'Scan already recorded for this scan type' });
    }
    
    // Determine scan success: pickups are always successful; drop-offs require a preceding pickup
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
    
    // Record the scan event
    const eventRecord = {
      scanType,
      cycle,
      timestamp: new Date(),
      success: success,
    };
    bestMatch.scans.push(eventRecord);
    await bestMatch.save();
    
    // Prepare email notifications based on pickup or dropoff
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

// ----------------- AUTHENTICATION & LOCATION -----------------
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (token) {
    jwt.verify(token.split(' ')[1], 'secret_key', (err, decoded) => {
      if (err) {
        return res.status(401).send('Invalid token');
      } else {
        console.log('Decoded token:', decoded);
        req.busNumber = decoded.bus;
        console.log('Bus number set to:', req.busNumber);
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

// ----------------- INITIALIZATION -----------------

async function initializeServer() {
  try {
    await initializeDatabase();
    await loadFaceModels();
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Initialization error:", err);
  }
}

// Load face-api models from "face-models" folder
async function loadFaceModels() {
  try {
    const faceapi = require('face-api.js');
    const canvas = require('canvas');
    const { Canvas, Image, ImageData } = canvas;
    faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
    const MODEL_URL = path.join(__dirname, '/face-models');
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
    console.log("Face-api models loaded");
  } catch (err) {
    console.error("Error loading face-api models:", err);
    throw err;
  }
}

initializeServer();
