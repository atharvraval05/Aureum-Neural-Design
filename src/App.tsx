import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Makeover from './pages/Makeover';
import AetherVision from './pages/AetherVision';
import Community from './pages/Community';
import Profile from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="makeover" element={<Makeover />} />
            <Route path="aether-vision" element={<AetherVision />} />
            <Route path="community" element={<Community />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
