import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/LoginPage';
import SignUp from '../pages/SignUpPage';
import Tasks from '../pages/TasksPage';

import NotFound from '../pages/NotFoundPage';
import AccessDenied from '../pages/AccessDeniedPage';
import Admin from '../pages/AdminPage';

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
                path="/register" 
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