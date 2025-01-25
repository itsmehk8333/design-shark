import React, { useState, useEffect, useMemo, useReducer } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    Snackbar,
    Grid,
    Chip,
    CircularProgress
} from '@mui/material';
import "../CSS/Task.css";
import { Edit, Search, FilterList } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import protectedAPI from '../auth/auth.instance';

// Styled Components
const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
    '& h4': {
        fontWeight: 600,
        color: theme.palette.primary.main
    }
}));

const FilterContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    background: '#f8f9fa',
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(3),
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
    borderRadius: theme.spacing(1),
    '& .MuiTableCell-head': {
        fontWeight: 600,
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.primary.contrastText
    },
    '& .MuiTableRow-root:hover': {
        backgroundColor: '#f5f5f5'
    }
}));

const StatusChip = styled(Chip)(({ status }) => ({
    width: 100,
    fontWeight: 500,
    ...(status === 0 && {
        backgroundColor: '#fff3e0',
        color: '#ed6c02'
    }),
    ...(status === 1 && {
        backgroundColor: '#e3f2fd',
        color: '#0288d1'
    }),
    ...(status === 2 && {
        backgroundColor: '#e8f5e9',
        color: '#2e7d32'
    })
}));

const statusOptions = [
    { value: -1, label: 'All Status' },
    { value: 0, label: 'Pending' },
    { value: 1, label: 'In Progress' },
    { value: 2, label: 'Completed' }
];

const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'today', label: 'Due Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
];

const sortOptions = [
    { value: 'dueDate', label: 'Due Date' },
    { value: 'status', label: 'Status' },
    { value: 'title', label: 'Title' }
];

const initialState = {
    tasks: [],
    loading: true,
    filters: {
        status: -1,
        dateRange: 'all',
        searchQuery: '',
        sortBy: 'dueDate',
        sortOrder: 'asc'
    },
    updateDialog: {
        open: false,
        taskId: null,
        currentStatus: ''
    },
    notification: {
        open: false,
        message: '',
        severity: 'success'
    }
};

function reducer(state, action) {
    switch (action.type) {
        case 'SET_TASKS':
            return { ...state, tasks: action.payload, loading: false };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_FILTERS':
            return { ...state, filters: { ...state.filters, ...action.payload } };
        case 'SET_UPDATE_DIALOG':
            return { ...state, updateDialog: { ...state.updateDialog, ...action.payload } };
        case 'SET_NOTIFICATION':
            return { ...state, notification: { ...state.notification, ...action.payload } };
        default:
            return state;
    }
}

function Tasks() {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const response = await protectedAPI.get('/tasks/my-tasks');
            dispatch({ type: 'SET_TASKS', payload: response.data });
        } catch (error) {
            showNotification('Error fetching tasks', 'error');
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const handleUpdateStatus = async () => {
        try {
            await protectedAPI.patch(`/tasks/${state.updateDialog.taskId}`, {
                status: state.updateDialog.currentStatus
            });
            fetchTasks();
            dispatch({ type: 'SET_UPDATE_DIALOG', payload: { open: false, taskId: null, currentStatus: '' } });
            showNotification('Task status updated successfully', 'success');
        } catch (error) {
            showNotification('Error updating task status', 'error');
        }
    };

    const showNotification = (message, severity) => {
        dispatch({ type: 'SET_NOTIFICATION', payload: { open: true, message, severity } });
    };

    const filteredAndSortedTasks = useMemo(() => {
        return state.tasks.filter(task => {
            if (state.filters.status !== -1 && task.status !== state.filters.status) return false;

            if (state.filters.searchQuery) {
                const query = state.filters.searchQuery.toLowerCase();
                if (!task.title.toLowerCase().includes(query) &&
                    !task.description.toLowerCase().includes(query)) {
                    return false;
                }
            }

            if (state.filters.dateRange !== 'all') {
                const taskDate = new Date(task.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                switch (state.filters.dateRange) {
                    case 'overdue':
                        return taskDate < today;
                    case 'today':
                        return taskDate.toDateString() === today.toDateString();
                    case 'week':
                        const weekLater = new Date(today);
                        weekLater.setDate(today.getDate() + 7);
                        return taskDate >= today && taskDate <= weekLater;
                    case 'month':
                        const monthLater = new Date(today);
                        monthLater.setMonth(today.getMonth() + 1);
                        return taskDate >= today && taskDate <= monthLater;
                    default:
                        return true;
                }
            }
            return true;
        }).sort((a, b) => {
            const sortOrder = state.filters.sortOrder === 'asc' ? 1 : -1;

            switch (state.filters.sortBy) {
                case 'dueDate':
                    return sortOrder * (new Date(a.dueDate) - new Date(b.dueDate));
                case 'status':
                    return sortOrder * (a.status - b.status);
                case 'title':
                    return sortOrder * a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });
    }, [state.tasks, state.filters]);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <StyledHeader>
                <Typography variant="h4" className="my-tasks-heading">My Tasks</Typography>
            </StyledHeader>

            <FilterContainer>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        className="filter-heading"
                    >
                        <FilterList /> Filters & Sort
                    </Typography>
                </Box>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Search Tasks"
                            value={state.filters.searchQuery}
                            onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { searchQuery: e.target.value } })}
                            InputProps={{
                                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                                className: 'filter-input',
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <TextField
                            select
                            fullWidth
                            label="Status"
                            value={state.filters.status}
                            onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { status: parseInt(e.target.value) } })}
                            className="filter-input"
                        >
                            {statusOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value} className="filter-input">
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <TextField
                            select
                            fullWidth
                            label="Due Date"
                            value={state.filters.dateRange}
                            onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { dateRange: e.target.value } })}
                            className="filter-input"
                        >
                            {dateRangeOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value} className="filter-input">
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <TextField
                            select
                            fullWidth
                            label="Sort Order"
                            value={state.filters.sortOrder}
                            onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { sortOrder: e.target.value } })}
                            className="filter-input"
                        >
                            <MenuItem value="asc" className="filter-input">Ascending</MenuItem>
                            <MenuItem value="desc" className="filter-input">Descending</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </FilterContainer>

            <StyledTableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {state.loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : filteredAndSortedTasks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1" color="textSecondary" className="task-content">
                                        {state.filters.searchQuery || state.filters.status !== -1 || state.filters.dateRange !== 'all'
                                            ? 'No tasks found matching your filters'
                                            : 'No tasks assigned yet'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAndSortedTasks.map((task) => (
                                <TableRow key={task._id}>
                                    <TableCell sx={{ fontWeight: 500 }}>{task.title}</TableCell>
                                    <TableCell className="task-content">{task.description}</TableCell>
                                    <TableCell className="task-content">
                                        {task.dueDate ?
                                            new Date(task.dueDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })
                                            : 'No due date'
                                        }
                                    </TableCell>
                                    <TableCell>
                                        <StatusChip
                                            label={task.status === 0 ? "Pending" :
                                                task.status === 1 ? "In Progress" :
                                                    "Completed"}
                                            status={task.status}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            startIcon={<Edit />}
                                            onClick={() => dispatch({
                                                type: 'SET_UPDATE_DIALOG',
                                                payload: { open: true, taskId: task._id, currentStatus: task.status }
                                            })}
                                            size="small"
                                        >
                                            Update Status
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </StyledTableContainer>

            <Dialog
                open={state.updateDialog.open}
                onClose={() => dispatch({ type: 'SET_UPDATE_DIALOG', payload: { open: false, taskId: null, currentStatus: '' } })}
            >
                <DialogTitle>Update Task Status</DialogTitle>
                <DialogContent>
                    <TextField
                        select
                        fullWidth
                        margin="dense"
                        label="Status"
                        value={state.updateDialog.currentStatus}
                        onChange={(e) => dispatch({
                            type: 'SET_UPDATE_DIALOG',
                            payload: { currentStatus: parseInt(e.target.value) }
                        })}
                    >
                        {statusOptions.filter(option => option.value !== -1).map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => dispatch({ type: 'SET_UPDATE_DIALOG', payload: { open: false, taskId: null, currentStatus: '' } })}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateStatus} variant="contained">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={state.notification.open}
                autoHideDuration={6000}
                onClose={() => dispatch({ type: 'SET_NOTIFICATION', payload: { open: false } })}
            >
                <Alert
                    onClose={() => dispatch({ type: 'SET_NOTIFICATION', payload: { open: false } })}
                    severity={state.notification.severity}
                >
                    {state.notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default Tasks;
