import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';

// Fix for default marker icon issues with Webpack
delete L.Icon.Default.prototype._getIconUrl;
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

// Component to add the search control
function LeafletSearchControl({ onLocationSelected }) {
  const map = useMap();
  const geocoderRef = useRef(null);

  useEffect(() => {
    if (!geocoderRef.current) {
      const geocoder = L.Control.Geocoder.nominatim();
      
      geocoderRef.current = L.Control.geocoder({
        defaultMarkGeocode: false,
        placeholder: "Search location...",
        collapsed: true,
        geocoder: geocoder
      }).addTo(map);

      geocoderRef.current.on('markgeocode', function (e) {
        const { center, name, bbox } = e.geocode;
        onLocationSelected({ lat: center.lat, lng: center.lng, name, bbox });
        map.fitBounds(bbox);
      });
    }

    return () => {
      if (geocoderRef.current) {
        map.removeControl(geocoderRef.current);
        geocoderRef.current = null;
      }
    };
  }, [map, onLocationSelected]);

  return null;
}

function PatientSearch() {
  const [doctors, setDoctors] = useState([]);
  const [searchCoords, setSearchCoords] = useState(null);
  const [searchLocationName, setSearchLocationName] = useState('');

  const handleSearch = async (lat, lng) => {
    if (!lat || !lng) {
      alert('Please select a location on the map using the search or by clicking.');
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5004/api/doctors/search?lat=${lat}&lng=${lng}&radius=5004`);
      setDoctors(response.data);
    } catch (error) {
      console.error('Error searching doctors:', error);
      alert('Failed to search for doctors.');
      setDoctors([]);
    }
  };

  const handleLocationSelected = (locationInfo) => {
    setSearchCoords({ lat: locationInfo.lat, lng: locationInfo.lng });
    setSearchLocationName(locationInfo.name);
    handleSearch(locationInfo.lat, locationInfo.lng);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-green-700">Patient Search</h2>
      <div className="mb-4">
        <p className="text-gray-700">
          Search for a location using the search box on the map.
        </p>
        {searchLocationName && (
          <p className="mt-2 text-gray-800 font-medium">
            Searching near: {searchLocationName}
          </p>
        )}
      </div>

      <MapContainer
        center={searchCoords || center}
        zoom={searchCoords ? 12 : 10}
        scrollWheelZoom={true}
        style={containerStyle}
        className="rounded-md"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LeafletSearchControl onLocationSelected={handleLocationSelected} />

        {doctors.map(doctor => (
          <Marker
            key={doctor._id}
            position={{ lat: doctor.location.coordinates[1], lng: doctor.location.coordinates[0] }}
          >
            <Popup>
              <span className="font-semibold">{doctor.name}</span><br />
              <span>{doctor.address}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="mt-4">
        <h3 className="text-xl font-medium mb-2 text-green-800">Doctors Found:</h3>
        {doctors.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {doctors.map(doctor => (
              <li key={doctor._id} className="py-2">
                <p className="font-semibold text-gray-900">{doctor.name}</p>
                <p className="text-gray-600 text-sm">{doctor.address}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No doctors found for this search or location not selected.</p>
        )}
      </div>
    </div>
  );
}

export default PatientSearch;