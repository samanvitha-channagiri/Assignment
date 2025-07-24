const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema({
    name: String,
    address: String,
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
    }
});
const Doctor = mongoose.model('Doctor', DoctorSchema);