import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

function NotFound() {
    const navigate = useNavigate();

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
                <ErrorOutlineIcon
                    sx={{
                        fontSize: '100px',
                        color: '#666',
                        mb: 2
                    }}
                />
                <Typography
                    variant="h1"
                    sx={{
                        fontSize: { xs: '6rem', md: '8rem' },
                        fontWeight: 'bold',
                        color: '#333',
                        mb: 2
                    }}
                >
                    404
                </Typography>
                <Typography
                    variant="h5"
                    sx={{
                        mb: 4,
                        color: '#666'
                    }}
                >
                    Oops! Page not found
                </Typography>
                {/* <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/')}
                    sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1.1rem'
                    }}
                >
                    Return to Home
                </Button> */}
            </Box>
        </Container>
    );
}

export default NotFound;