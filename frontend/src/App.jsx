import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import DonorDashboard from './pages/donor/Dashboard';
import DonorProfile from './pages/donor/Profile';
import DonorBloodInfo from './pages/donor/BloodInfo';
import DonorEvents from './pages/donor/Events';
import DonorEventDetail from './pages/donor/EventDetail';
import DonorRegistrations from './pages/donor/Registrations';
import DonorHistory from './pages/donor/History';
import DonorLocations from './pages/donor/Locations';
import OrgDashboard from './pages/organization/Dashboard';
import OrgEvents from './pages/organization/Events';
import OrgApprovals from './pages/organization/Approvals';
import HospitalDashboard from './pages/hospital/Dashboard';
import VolunteerDashboard from './pages/volunteer/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Donor routes */}
          <Route 
            path="/donor/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['nguoi_hien']}>
                <DonorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/donor/profile" 
            element={
              <ProtectedRoute allowedRoles={['nguoi_hien']}>
                <DonorProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/donor/blood-info" 
            element={
              <ProtectedRoute allowedRoles={['nguoi_hien']}>
                <DonorBloodInfo />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/donor/events" 
            element={
              <ProtectedRoute allowedRoles={['nguoi_hien']}>
                <DonorEvents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/donor/events/:id" 
            element={
              <ProtectedRoute allowedRoles={['nguoi_hien']}>
                <DonorEventDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/donor/registrations" 
            element={
              <ProtectedRoute allowedRoles={['nguoi_hien']}>
                <DonorRegistrations />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/donor/history" 
            element={
              <ProtectedRoute allowedRoles={['nguoi_hien']}>
                <DonorHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/donor/locations" 
            element={
              <ProtectedRoute allowedRoles={['nguoi_hien']}>
                <DonorLocations />
              </ProtectedRoute>
            } 
          />
          
          {/* Organization routes */}
          <Route 
            path="/organization/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['to_chuc']}>
                <OrgDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/organization/events" 
            element={
              <ProtectedRoute allowedRoles={['to_chuc']}>
                <OrgEvents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/organization/approvals" 
            element={
              <ProtectedRoute allowedRoles={['to_chuc']}>
                <OrgApprovals />
              </ProtectedRoute>
            } 
          />
          
          {/* Hospital routes */}
          <Route 
            path="/hospital/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['benh_vien']}>
                <HospitalDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Volunteer routes */}
          <Route 
            path="/volunteer/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['nhom_tinh_nguyen']}>
                <VolunteerDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
