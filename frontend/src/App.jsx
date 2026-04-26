import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Login from './pages/Login';
import LoginSuccess from './pages/LoginSuccess';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Catalogue from './pages/Catalogue';
import BookResource from './pages/BookResource';
import ManageBookings from './pages/ManageBookings';
import ReportIssue from './pages/ReportIssue';
import TechnicianDashboard from './pages/TechnicianDashboard';
import TicketDetails from './pages/TicketDetails';
import Notifications from './pages/Notifications';
import AdminPanel from './pages/AdminPanel';
import Settings from './pages/Settings';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    
    if (loading) return <div style={{textAlign: 'center', marginTop: '50px'}}>Loading profile...</div>;
    
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <NotificationProvider>
                <Router>
                    <Navbar />
                    <div style={{ minHeight: 'calc(100vh - 70px)', paddingBottom: '40px' }}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                    <Route path="/login/success" element={<LoginSuccess />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    
                    {/* Secure Route */}
                    <Route path="/dashboard" element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/catalogue" element={
                        <PrivateRoute>
                            <Catalogue />
                        </PrivateRoute>
                    } />
                    <Route path="/book/:id" element={
                        <PrivateRoute>
                            <BookResource />
                        </PrivateRoute>
                    } />
                    <Route path="/admin/bookings" element={
                        <PrivateRoute>
                            <ManageBookings />
                        </PrivateRoute>
                    } />
                    <Route path="/report/:id" element={
                        <PrivateRoute>
                            <ReportIssue />
                        </PrivateRoute>
                    } />
                    <Route path="/ticket/:id" element={
                        <PrivateRoute>
                            <TicketDetails />
                        </PrivateRoute>
                    } />
                    <Route path="/technician/desk" element={
                        <PrivateRoute>
                            <TechnicianDashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/notifications" element={
                        <PrivateRoute>
                            <Notifications />
                        </PrivateRoute>
                    } />
                    <Route path="/admin/panel" element={
                        <PrivateRoute>
                            <AdminPanel />
                        </PrivateRoute>
                    } />
                    <Route path="/settings" element={
                        <PrivateRoute>
                            <Settings />
                        </PrivateRoute>
                    } />
                    
                        {/* Default Route */}
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        </Routes>
                    </div>
                </Router>
            </NotificationProvider>
        </AuthProvider>
    );
}

export default App;
