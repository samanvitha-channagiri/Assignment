// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Doctor = require('./models/Doctor')
require('dotenv').config();

const app = express();

app.use(cors({
    origin:'http://localhost:5173',
   
    credentials: true
    
}));

app.use(express.json());
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// models/Doctor.js
const DoctorSchema = new mongoose.Schema({
    name: String,
    address: String,
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
    }
});
// const Doctor = mongoose.model('Doctor', DoctorSchema);

// routes/doctors.js
app.post('/api/doctors', async (req, res) => {
    try {
        const { name, address, lat, lng } = req.body;
        const newDoctor = new Doctor({
            name,
            address,
            location: {
                type: 'Point',
                coordinates: [lng, lat]
            }
        });
        await newDoctor.save();
        res.status(201).json({ message: 'Doctor clinic added successfully', doctor: newDoctor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/doctors/search', async (req, res) => {
    try {
        const { lat, lng, radius } = req.query; // Or a search string to geocode
        let doctors;
        if (lat && lng && radius) {
            doctors = await Doctor.find({
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [parseFloat(lng), parseFloat(lat)]
                        },
                        $maxDistance: parseInt(radius) // in meters
                    }
                }
            });
        } else {
            // Implement geocoding for string search like "JP Nagar" and then use $geoWithin
            // For simplicity, this example assumes lat/lng/radius.
            doctors = await Doctor.find({}); // Fallback or more complex logic
        }
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));