import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet'; // Import Leaflet library
import 'leaflet/dist/leaflet.css'; // Make sure Leaflet CSS is imported

// Fix for default marker icon issues with Webpack
delete L.Icon.Default.prototype._getIconUrl; // Corrected line
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 12.9716, // Bangalore
  lng: 77.5946
};

function DoctorDashboard() {
  const [markerPosition, setMarkerPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [doctorName, setDoctorName] = useState('');

  // Custom component to handle map click events
  function MapClickHandler() {
    const map = useMapEvents({
      click: (e) => {
        setMarkerPosition(e.latlng);
        geocodeLatLng(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  const geocodeLatLng = async (lat, lng) => {
    try {
      // Using OpenStreetMap's Nominatim for reverse geocoding
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      if (response.data && response.data.display_name) {
        setAddress(response.data.display_name);
      } else {
        setAddress('Address not found');
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      setAddress('Error getting address');
    }
  };

  const handleAddClinic = async () => {
    if (!doctorName || !markerPosition || !address) {
      alert('Please fill all fields and select a location on the map.');
      return;
    }
    try {
      await axios.post('http://localhost:5004/api/doctors', {
        name: doctorName,
        address: address,
        lat: markerPosition.lat,
        lng: markerPosition.lng
      }, {
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});
      alert('Clinic added successfully!');
      setDoctorName('');
      setAddress('');
      setMarkerPosition(null);
    } catch (error) {
      console.error('Error adding clinic:', error);
      alert('Failed to add clinic.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-blue-700">Doctor Dashboard</h2>
      <input
        type="text"
        placeholder="Doctor Name"
        className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        value={doctorName}
        onChange={(e) => setDoctorName(e.target.value)}
      />
      <MapContainer
        center={center}
        zoom={10}
        scrollWheelZoom={true}
        style={containerStyle}
        className="rounded-md"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markerPosition && <Marker position={markerPosition} />}
        <MapClickHandler />
      </MapContainer>
      <p className="mt-4 text-gray-700">Selected Address: <span className="font-medium">{address}</span></p>
      <button
        onClick={handleAddClinic}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Add Clinic
      </button>
    </div>
  );
}

export default DoctorDashboard;