const express = require('express');
const app = express();

// Place CORS middleware at the very top so it applies to all requests
const cors = require('cors');
app.use(cors());

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const nodemailer = require('nodemailer');
const path = require('path');
const port = 3000;
const authMiddleware = require('./middle.js');

// Update express.json to handle large payloads (e.g., Base64 images)
app.use(express.json({ limit: '100mb' }));

// Import BusLocation model early
const BusLocation = require('./models/BusLocation');

app.use(morgan('dev'));
require('dotenv').config();
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

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
const Student = require('./models/Student');
const Admin = require('./models/Admin');

// ----------------- END MODELS -----------------

// Get bus location by bus number

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
  const allowedEmail = 'admin@gmail.com'; 

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  if (email !== allowedEmail) {
    return res.status(403).json({ message: 'Registration is restricted to a specific email address' });
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
  const allowedEmail = 'admin@gmail.com';

  if (email !== allowedEmail) {
    return res.status(403).send('Login restricted to a specific email address');
  }

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

app.get('/home', authMiddleware, (req, res) => {
  res.send({ message: 'Welcome to the home page' });
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
      return Infinity;
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

// Helper function: check if a given date is today.
function isToday(dateInput) {
  const date = new Date(dateInput);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

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
    
    let cycle = "";
    if (scanType === "pickup_home" || scanType === "dropoff_school") {
      cycle = "morning";
    } else if (scanType === "pickup_school" || scanType === "dropoff_home") {
      cycle = "evening";
    } else {
      return res.status(400).json({ message: 'Invalid scanType' });
    }
    
    const twentyHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000);
    
    let bestMatch = null;
    let bestDistance = Infinity;
    for (const student of students) {
      const distance = await matchFaceAsync(scannedFace, student.photo);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestMatch = student;
      }
    }
    
    if (!bestMatch || bestDistance > 0.4) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const isAbsent = bestMatch.scans.some(event => event.scanType === "absent" && isToday(event.timestamp));
    if (isAbsent) {
      return res.status(400).json({ message: 'Student marked absent for today.' });
    }
    
    if ((scanType === "dropoff_school" || scanType === "dropoff_home")) {
      const expectedPickupType = (scanType === "dropoff_school") ? "pickup_home" : "pickup_school";
      const pickupEvent = bestMatch.scans.find(event => event.scanType === expectedPickupType && isToday(event.timestamp));
      if (!pickupEvent) {
        return res.status(400).json({ message: 'Student not properly picked up earlier; cannot drop off.' });
      }
    }
    
    const existingEvent = bestMatch.scans.find(event => event.scanType === scanType);
    if (existingEvent) {
      return res.status(400).json({ message: 'Scan already recorded for this scan type' });
    }
    
    const eventRecord = {
      scanType,
      cycle,
      timestamp: new Date(),
      success: true,
    };
    bestMatch.scans.push(eventRecord);
    await bestMatch.save();
    
    let subject = '';
    let text = '';
    if (scanType === "pickup_home" || scanType === "pickup_school") {
      subject = `Pickup Successful: ${bestMatch.name}`;
      text = `Student ${bestMatch.name} (ID: ${bestMatch.studentId}) was successfully picked up at ${new Date().toLocaleTimeString()} on bus ${busNumber}.`;
    } else if (scanType === "dropoff_school" || scanType === "dropoff_home") {
      subject = `Drop-off Successful: ${bestMatch.name}`;
      text = `Student ${bestMatch.name} (ID: ${bestMatch.studentId}) was successfully dropped off at ${new Date().toLocaleTimeString()} on bus ${busNumber}.`;
    }
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: bestMatch.email,
      subject,
      text,
    });
    
    if (scanType === "dropoff_school" && cycle === "morning") {
      for (const student of students) {
        student.scans = student.scans.filter(event => new Date(event.timestamp) > twentyHoursAgo);
        const hasPickup = student.scans.some(event => event.scanType === "pickup_home" && isToday(event.timestamp));
        const alreadyAbsent = student.scans.some(event => event.scanType === "absent" && isToday(event.timestamp));
        if (!hasPickup && !alreadyAbsent) {
          const absentEvent = {
            scanType: "absent",
            cycle: "morning",
            timestamp: new Date(),
            success: false,
          };
          student.scans.push(absentEvent);
          await student.save();
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: `Absence Notification: ${student.name}`,
            text: `Student ${student.name} (ID: ${student.studentId}) was not picked up this morning on bus ${busNumber} and is marked absent for today.`
          });
          console.log(`Student ${student.studentId} marked absent.`);
        }
      }
    }
    
    return res.json({ message: `Scan processed successfully: ${scanType.includes("pickup") ? 'Pickup' : 'Drop-off'} confirmed, email sent.` });
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

// online/offline status endpoint
app.post('/update-status', authenticate, async (req, res) => {
  const { online } = req.body;
  try {
    let busLocation = await BusLocation.findOne({ busNumber: req.busNumber });
    if (busLocation) {
      busLocation.online = online; // add the "online" field to the location document
      await busLocation.save();
      res.json({ message: `Status updated to ${online}` });
    } else {
      // If no location document exists yet, create one with default coordinates (e.g., 0,0)
      busLocation = new BusLocation({ busNumber: req.busNumber, latitude: 0, longitude: 0, online });
      await busLocation.save();
      res.json({ message: `Status created as ${online}`, locationId: busLocation._id });
    }
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Error updating status' });
  }
});

// update location driver endpoint:
app.post('/update-location', authenticate, async (req, res) => {
  const { latitude, longitude } = req.body;
  try {
    let busLocation = await BusLocation.findOne({ busNumber: req.busNumber });
    if (busLocation) {
      busLocation.latitude = latitude;
      busLocation.longitude = longitude;
      busLocation.timestamp = new Date();
      // Update the online field to true whenever location is updated:
      busLocation.online = true;
      await busLocation.save();
      res.json({ message: 'Location updated' });
    } else {
      // When creating a new document, set online to true if the driver is active
      busLocation = new BusLocation({ busNumber: req.busNumber, latitude, longitude, online: true });
      await busLocation.save();
      res.json({ message: 'Location created', locationId: busLocation._id });
    }
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Error updating location' });
  }
});

app.get('/bus-location/:busNumber', async (req, res) => {
  const { busNumber } = req.params;
  try {
    const busLocation = await BusLocation.findOne({ busNumber }).sort({ timestamp: -1 });
    if (busLocation) {
      res.json(busLocation);
    } else {
      res.status(404).json({ message: 'Bus not found' });
    }
  } catch (err) {
    console.error('Error fetching bus location:', err);
    res.status(500).json({ message: 'Error fetching bus location' });
  }
});

// ----------------- INITIALIZATION -----------------
async function initializeServer() {
  try {
    await initializeDatabase();
    await loadFaceModels();
    // Create HTTP server and attach Socket.IO without modifying existing endpoints.
    const http = require('http');
    const socketio = require('socket.io');
    const server = http.createServer(app);
    const io = socketio(server, { cors: { origin: "*" } });
    
    io.on('connection', (socket) => {
      console.log(`New client connected: ${socket.id}`);
      socket.on('joinBusRoom', (busNumber) => {
        socket.join(busNumber);
        console.log(`Socket ${socket.id} joined room: ${busNumber}`);
      });
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
    
    server.listen(port, () => {
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
//locking sever.js