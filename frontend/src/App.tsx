import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import DonorDashboard from './pages/DonorDashboard';
import NGORequestForm from './pages/NGORequestForm';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AIChatbot from './pages/AIChatbot';
import SimpleChatbot from './components/SimpleChatbot';
import ConfirmationPage from './pages/ConfirmationPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<AuthPage />} />

              {/* Protected routes with role-based access */}
              <Route
                path="/donor"
                element={
                  <ProtectedRoute allowedRoles={['donor']}>
                    <DonorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ngo"
                element={
                  <ProtectedRoute allowedRoles={['ngo']}>
                    <NGORequestForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ngo-request"
                element={
                  <ProtectedRoute allowedRoles={['ngo']}>
                    <NGORequestForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/volunteer"
                element={
                  <ProtectedRoute allowedRoles={['volunteer']}>
                    <VolunteerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/volunteer-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['volunteer']}>
                    <VolunteerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Routes accessible by all authenticated users */}
              <Route
                path="/chatbot"
                element={
                  <ProtectedRoute>
                    <AIChatbot />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/confirmation"
                element={
                  <ProtectedRoute>
                    <ConfirmationPage />
                  </ProtectedRoute>
                }
              />
            </Routes>

            {/* Universal Floating Chatbot - shows on all pages */}
            <SimpleChatbot />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
