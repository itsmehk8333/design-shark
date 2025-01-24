import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BlockIcon from '@mui/icons-material/Block';

function AccessDenied() {
    const navigate = useNavigate();
    const role = localStorage.getItem('role');

    return (
        <Container maxWidth="md">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    textAlign: 'center',
                }}
            >
                <BlockIcon 
                    sx={{ 
                        fontSize: '80px', 
                        color: '#dc3545',
                        mb: 3 
                    }} 
                />
                <Typography
                    variant="h3"
                    sx={{
                        fontWeight: 'bold',
                        color: '#333',
                        mb: 2
                    }}
                >
                    Access Denied
                </Typography>
                <Typography
                    variant="h6"
                    sx={{
                        mb: 4,
                        color: '#666'
                    }}
                >
                    You don't have permission to access this page.
                    <br />
                    Current role: {role}
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate(role === 'admin' ? '/admin/tasks' : '/tasks')}
                    sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1.1rem'
                    }}
                >
                    Go to Dashboard
                </Button>
            </Box>
        </Container>
    );
}

export default AccessDenied;