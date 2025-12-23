import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { SocketProvider } from './contexts/SocketContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import PublicEvents from './pages/PublicEvents';
import SearchEvents from './pages/SearchEvents';
import ProtectedRoute from './components/ProtectedRoute';
import DonorDashboard from './pages/donor/Dashboard';
import DonorProfile from './pages/donor/Profile';
import DonorBloodInfo from './pages/donor/BloodInfo';
import DonorEvents from './pages/donor/Events';
import DonorEventDetail from './pages/donor/EventDetail';
import EventRegistrationForm from './pages/donor/EventRegistrationForm';
import DonorRegistrations from './pages/donor/Registrations';
import RegistrationDetail from './pages/donor/RegistrationDetail';
import DonorHistory from './pages/donor/History';
import OrgDashboard from './pages/organization/Dashboard';
import OrgEvents from './pages/organization/Events';
import OrgApprovals from './pages/organization/Approvals';
import EventForm from './pages/organization/EventForm';
import EventDetail from './pages/organization/EventDetail';
import EventRegistrations from './pages/organization/EventRegistrations';
import OrgRegistrationList from './pages/organization/RegistrationList';
import HospitalDashboard from './pages/hospital/Dashboard';
import HospitalProfile from './pages/hospital/Profile';
import HospitalBloodTypeConfirmation from './pages/hospital/BloodTypeConfirmation';
import HospitalEventApproval from './pages/hospital/EventApproval';
import HospitalRegistrationList from './pages/hospital/RegistrationList';
import HospitalResultUpdate from './pages/hospital/ResultUpdate';
import HospitalNotificationCreate from './pages/hospital/NotificationCreate';
import VolunteerDashboard from './pages/volunteer/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminEvents from './pages/admin/Events';
import AdminRegistrations from './pages/admin/Registrations';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ToastProvider>
          <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/events" element={<PublicEvents />} />
          <Route path="/search" element={<SearchEvents />} />
          
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
            path="/donor/events/:eventId/register" 
            element={
              <ProtectedRoute allowedRoles={['nguoi_hien']}>
                <EventRegistrationForm />
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
            path="/donor/registrations/:id" 
            element={
              <ProtectedRoute allowedRoles={['nguoi_hien']}>
                <RegistrationDetail />
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
            path="/organization/events/new" 
            element={
              <ProtectedRoute allowedRoles={['to_chuc']}>
                <EventForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/organization/events/:id" 
            element={
              <ProtectedRoute allowedRoles={['to_chuc']}>
                <EventDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/organization/events/:id/edit" 
            element={
              <ProtectedRoute allowedRoles={['to_chuc']}>
                <EventForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/organization/events/:id/registrations" 
            element={
              <ProtectedRoute allowedRoles={['to_chuc']}>
                <EventRegistrations />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/organization/registrations" 
            element={
              <ProtectedRoute allowedRoles={['to_chuc']}>
                <OrgRegistrationList />
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
          <Route 
            path="/hospital/profile" 
            element={
              <ProtectedRoute allowedRoles={['benh_vien']}>
                <HospitalProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/hospital/blood-type-confirmation" 
            element={
              <ProtectedRoute allowedRoles={['benh_vien']}>
                <HospitalBloodTypeConfirmation />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/hospital/event-approval" 
            element={
              <ProtectedRoute allowedRoles={['benh_vien']}>
                <HospitalEventApproval />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/hospital/registrations" 
            element={
              <ProtectedRoute allowedRoles={['benh_vien']}>
                <HospitalRegistrationList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/hospital/results" 
            element={
              <ProtectedRoute allowedRoles={['benh_vien']}>
                <HospitalResultUpdate />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/hospital/notifications" 
            element={
              <ProtectedRoute allowedRoles={['benh_vien']}>
                <HospitalNotificationCreate />
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
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/events" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminEvents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/registrations" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminRegistrations />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/reports" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/settings" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettings />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
          </Router>
        </ToastProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
