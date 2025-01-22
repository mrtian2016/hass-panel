import React from 'react';
import { Route } from 'react-router-dom';
import Message from './pages/message';
import My from './pages/my';

const AppRoutes = () => [
  <Route key="message" path="/message" element={<Message />} />,
  <Route key="my" path="/my" element={<My />} />
];

export default AppRoutes; 