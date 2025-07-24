import React from 'react';
import DoctorDashboard from './components/DoctorDashboard.jsx';
import PatientSearch from './components/PatientSearch.jsx';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-center text-blue-800 mb-8">Doctor-Patient Platform</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DoctorDashboard />
        <PatientSearch />
      </div>
    </div>
  );
}

export default App;