import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Message from './pages/message';
import My from './pages/my';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/message" element={<Message />} />
      <Route path="/my" element={<My />} />
    </Routes>
  );
}

export default AppRoutes; 