import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import NewPropertyPage from './pages/NewPropertyPage';
import EditPropertyPage from './pages/EditPropertyPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<PropertiesPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/properties/:id" element={<PropertyDetailsPage />} />
              <Route path="/properties/new" element={<NewPropertyPage />} />
              <Route path="/properties/:id/edit" element={<EditPropertyPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>
          <Chatbot />
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;