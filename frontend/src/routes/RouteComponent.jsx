import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import SignUp from '../pages/SignUp';
import Tasks from '../pages/Tasks';
import Admin from '../pages/Admin';
import NotFound from '../pages/NotFound';
import AccessDenied from '../pages/AccessDenied';

// User Route Component
const UserRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) return <Navigate to="/login" replace />;
    if (role !== 'user') return <Navigate to="/admin/tasks" replace />;
    
    return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) return <Navigate to="/login" replace />;
    if (role !== 'admin') return <AccessDenied />;
    
    return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token) {
        return <Navigate to={role === 'admin' ? '/admin/tasks' : '/tasks'} replace />;
    }
    
    return children;
};

function RouteComponent() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route 
                path="/login" 
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                } 
            />
            <Route 
                path="/signup" 
                element={
                    <PublicRoute>
                        <SignUp />
                    </PublicRoute>
                } 
            />

            {/* User Routes */}
            <Route 
                path="/tasks" 
                element={
                    // <UserRoute>
                        <Tasks />
                    // </UserRoute>
                } 
            />

            {/* Admin Routes */}
            <Route 
                path="/admin/tasks" 
                element={
                    <AdminRoute>
                        <Admin />
                    </AdminRoute>
                } 
            />

            {/* Default Routes */}
            <Route 
                path="/" 
                element={
                    <Navigate to={localStorage.getItem('role') === 'admin' ? '/admin/tasks' : '/tasks'} replace />
                } 
            />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default RouteComponent;