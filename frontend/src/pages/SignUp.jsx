import React, { useState } from 'react';
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
import '../CSS/Signup.css';
import { authAPI } from '../auth/auth.instance';

function SignUp() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        authAPI.post('/auth/register', formData).then((response) => {
            console.log(response.data);
        }
        );
        console.log(formData);
    };

    return (
        <div className="signup-container">
            <Container maxWidth="sm">
                <Paper className="signup-paper" elevation={3}>
                    <Typography variant="h4" className="signup-title">
                        Create Account
                    </Typography>
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
                    </Box>
                </Paper>
            </Container>
        </div>
    );
}

export default SignUp;