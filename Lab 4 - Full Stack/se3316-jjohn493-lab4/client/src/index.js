import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './component/LandingPage/LandingPage'; // Correct path to your LandingPage component
import Dashboard from './component/Dashboard/Dashboard'; // Correct path to your Dashboard component
import Admin from './component/Admin/Admin'; // Correct path to your Dashboard component


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
