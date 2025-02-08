import React from 'react';
import { Route } from 'react-router-dom';
import Message from './pages/message';
import My from './pages/my';
import Config from './pages/config';
const AppRoutes = () => [
  // <Route key="message" path="/message" element={<Message />} />,
  // <Route key="my" path="/my" element={<My />} />,
  <Route key="config" path="/config" element={<Config />} />
];

export default AppRoutes; 