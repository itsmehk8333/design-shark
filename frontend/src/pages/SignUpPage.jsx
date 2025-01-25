import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    InputAdornment,
    Container,
} from '@mui/material';
import { Person, Email, Lock } from '@mui/icons-material';
import '/src/CSS/Signup.css'
import { authAPI } from '../auth/auth.instance';

function SignUp() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
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
            const response = await authAPI.post('/auth/register', formData);
            console.log(response.data);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="signup-container">
            <Container maxWidth="sm">
                <Paper className="signup-paper" elevation={3}>
                    <Typography variant="h4" className="signup-title">
                        Create Account
                    </Typography>
                    {error && (
                        <Typography color="error" align="center" sx={{ mb: 2 }}>
                            {error}
                        </Typography>
                    )}
                    <Box component="form" onSubmit={handleSubmit} className="form-animation">
                        <TextField
                            className="input-field"
                            fullWidth
                            required
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person />
                                    </InputAdornment>
                                ),
                            }}
                        />
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
                            Sign Up
                        </Button>
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Typography variant="body1" color="textSecondary">
                                Already have an account?{' '}
                                <Link 
                                    to="/login" 
                                    style={{ 
                                        color: '#2563eb',
                                        textDecoration: 'none',
                                        fontWeight: 500
                                    }}
                                >
                                    Login here
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </div>
    );
}

export default SignUp;