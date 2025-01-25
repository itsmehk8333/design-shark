import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import { AccountCircle, Logout } from '@mui/icons-material';

function Navbar() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const role = localStorage.getItem('role');
  const navigate = useNavigate();

  // Check if current route is login or signup
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  // Don't render navbar on auth pages
  if (isAuthPage) return null;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#fff', boxShadow: 1 }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, color: '#333', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
        >
          Task Manager
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#666' }}>
            <IconButton size="large" sx={{ color: 'inherit' }}>
              <AccountCircle />
            </IconButton>
            <Typography 
              variant="subtitle1" 
              sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}
            >
              {user?.username}
            </Typography>
          </Box>

          <Button
            color="error"
            variant="outlined"
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400 }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
