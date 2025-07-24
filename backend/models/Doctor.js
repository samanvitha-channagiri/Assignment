const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema({
    name: String,
    address: String,
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
});

// Ensure 2dsphere index is created
DoctorSchema.index({ location: '2dsphere' });

const Doctor = mongoose.model('Doctor', DoctorSchema);

module.exports = Doctor;