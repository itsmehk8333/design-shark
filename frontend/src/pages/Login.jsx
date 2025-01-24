import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  Container,
} from '@mui/material';
import { Email, Lock } from '@mui/icons-material';
import { authAPI } from '../auth/auth.instance';
import '../CSS/Login.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authAPI.post('/auth/login', formData);
      const { accessToken, user, message } = response.data;
      
      // Store auth data
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', user.role);
      
      // Show success message
      console.log(message);
      
      // Redirect based on role
      navigate(user.role === 'admin' ? '/admin/tasks' : '/tasks');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  // Rest of the component remains same
  return (
    <div className="login-container">
      <Container maxWidth="sm">
        <Paper className="login-paper" elevation={3}>
          <Typography variant="h4" className="login-title">
            Welcome Back
          </Typography>
          {error && (
            <Typography color="error" align="center" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            {/* Existing form fields */}
            <TextField
              className="input-field"
              fullWidth
              required
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              className="input-field"
              fullWidth
              required
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              className="submit-button"
              type="submit"
              fullWidth
              variant="contained"
            >
              Login
            </Button>
          </Box>
        </Paper>
      </Container>
    </div>
  );
}

export default Login;