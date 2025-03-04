import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
    DialogContentText,
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
    CircularProgress,
    Chip
} from '@mui/material';
import { Add, Delete, Search, FilterList } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import protectedAPI from '../auth/auth.instance';

// Styled Components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
    borderRadius: theme.spacing(1),
    '& .MuiTableCell-head': {
        fontWeight: 600,
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.primary.contrastText
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

const FilterContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: '#f8f9fa',
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(3)
}));

// Main Admin Component
function Admin() {
    // States
    const [state, setState] = useState({
        tasks: [],
        users: [],
        loading: true,
        createDialog: false,
        deleteDialog: { open: false, taskId: null },
        notification: { open: false, message: '', severity: 'success' },
        newTask: { title: '', description: '', dueDate: '', assignedTo: '', status: 0 },
        filters: { status: -1, dateRange: 'all', assignedTo: '', searchQuery: '' }
    });

    const dateRangeOptions = useMemo(() => [
        { value: 'all', label: 'All Time' },
        { value: 'overdue', label: 'Overdue' },
        { value: 'today', label: 'Due Today' },
        { value: 'week', label: 'Due This Week' },
        { value: 'month', label: 'Due This Month' }
    ], []);

    useEffect(() => {
        fetchTasks();
        fetchUsers();
    }, []);

    const fetchTasks = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, loading: true }));
            const response = await protectedAPI.get('/tasks/admin/tasks');
            setState(prev => ({ ...prev, tasks: response.data, loading: false }));
        } catch (error) {
            showNotification('Error fetching tasks', 'error');
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            const response = await protectedAPI.get('/users');
            setState(prev => ({ ...prev, users: response.data.users }));
        } catch (error) {
            showNotification('Error fetching users', 'error');
        }
    }, []);

    const handleCreateTask = useCallback(async () => {
        try {
            await protectedAPI.post('/tasks', state.newTask);
            setState(prev => ({ ...prev, createDialog: false }));
            fetchTasks();
            showNotification('Task created successfully', 'success');
            resetNewTask();
        } catch (error) {
            showNotification('Error creating task', 'error');
        }
    }, [state.newTask, fetchTasks]);

    const handleDeleteConfirm = useCallback(async () => {
        try {
            await protectedAPI.delete(`/tasks/${state.deleteDialog.taskId}`);
            fetchTasks();
            setState(prev => ({ ...prev, deleteDialog: { open: false, taskId: null } }));
            showNotification('Task deleted successfully', 'success');
        } catch (error) {
            showNotification('Error deleting task', 'error');
        }
    }, [state.deleteDialog.taskId, fetchTasks]);

    const showNotification = useCallback((message, severity) => {
        setState(prev => ({ ...prev, notification: { open: true, message, severity } }));
    }, []);

    const resetNewTask = useCallback(() => {
        setState(prev => ({
            ...prev,
            newTask: { title: '', description: '', dueDate: '', assignedTo: '', status: 0 }
        }));
    }, []);

    const filteredTasks = useMemo(() => {
        return state.tasks.filter(task => {
            if (state.filters.status !== -1 && task.status !== state.filters.status) return false;
            if (state.filters.searchQuery && !task.title.toLowerCase().includes(state.filters.searchQuery.toLowerCase())) return false;
            if (state.filters.assignedTo && task.assignedTo._id !== state.filters.assignedTo) return false;

            if (state.filters.dateRange !== 'all') {
                const taskDate = new Date(task.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                switch (state.filters.dateRange) {
                    case 'overdue': return taskDate < today;
                    case 'today': return taskDate.toDateString() === today.toDateString();
                    case 'week':
                        const weekLater = new Date(today);
                        weekLater.setDate(today.getDate() + 7);
                        return taskDate >= today && taskDate <= weekLater;
                    case 'month':
                        const monthLater = new Date(today);
                        monthLater.setMonth(today.getMonth() + 1);
                        return taskDate >= today && taskDate <= monthLater;
                    default: return true;
                }
            }
            return true;
        });
    }, [state.tasks, state.filters]);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Header setCreateDialog={value => setState(prev => ({ ...prev, createDialog: value }))} />
            <Filters
                filters={state.filters}
                setFilters={filters => setState(prev => ({ ...prev, filters }))}
                users={state.users}
                dateRangeOptions={dateRangeOptions}
            />
            <TasksTable
                loading={state.loading}
                filteredTasks={filteredTasks}
                setDeleteDialog={deleteDialog => setState(prev => ({ ...prev, deleteDialog }))}
            />
            <CreateTaskDialog
                createDialog={state.createDialog}
                setCreateDialog={value => setState(prev => ({ ...prev, createDialog: value }))}
                newTask={state.newTask}
                setNewTask={newTask => setState(prev => ({ ...prev, newTask }))}
                users={state.users}
                handleCreateTask={handleCreateTask}
            />
            <DeleteConfirmationDialog
                deleteDialog={state.deleteDialog}
                setDeleteDialog={deleteDialog => setState(prev => ({ ...prev, deleteDialog }))}
                handleDeleteConfirm={handleDeleteConfirm}
            />
            <Notification
                notification={state.notification}
                setNotification={notification => setState(prev => ({ ...prev, notification }))}
            />
        </Container>
    );
}

// Header Component
const Header = ({ setCreateDialog }) => (
    <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Task Management</Typography>
        <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialog(true)}
        >
            Create Task
        </Button>
    </Box>
);

// Filters Component
const Filters = ({ filters, setFilters, users, dateRangeOptions }) => (
    <FilterContainer>
        <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterList /> Filters
            </Typography>
        </Box>
        <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Search by Title"
                    value={filters.searchQuery}
                    onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                    InputProps={{
                        startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />
                    }}
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <TextField
                    select
                    fullWidth
                    label="Status"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: parseInt(e.target.value) })}
                >
                    <MenuItem value={-1}>All Status</MenuItem>
                    <MenuItem value={0}>Pending</MenuItem>
                    <MenuItem value={1}>In Progress</MenuItem>
                    <MenuItem value={2}>Completed</MenuItem>
                </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
                <TextField
                    select
                    fullWidth
                    label="Due Date"
                    value={filters.dateRange}
                    onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                >
                    {dateRangeOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
                <TextField
                    select
                    fullWidth
                    label="Assigned To"
                    value={filters.assignedTo}
                    onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
                >
                    <MenuItem value="">All Users</MenuItem>
                    {users.map(user => (
                        <MenuItem key={user._id} value={user._id}>
                            {user.username}
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>
        </Grid>
    </FilterContainer>
);

// Tasks Table Component
const TasksTable = ({ loading, filteredTasks, setDeleteDialog }) => (
    <StyledTableContainer component={Paper}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                            <CircularProgress />
                        </TableCell>
                    </TableRow>
                ) : filteredTasks.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                            <Typography variant="body1" color="textSecondary">
                                No tasks found matching your filters
                            </Typography>
                        </TableCell>
                    </TableRow>
                ) : (
                    filteredTasks.map((task) => (
                        <TableRow key={task._id}>
                            <TableCell>{task.title}</TableCell>
                            <TableCell>{task.description}</TableCell>
                            <TableCell>
                                {new Date(task.dueDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </TableCell>
                            <TableCell>{task.assignedTo.username}</TableCell>
                            <TableCell>
                                <StatusChip
                                    label={task.status === 0 ? "Pending" : 
                                           task.status === 1 ? "In Progress" : 
                                           "Completed"}
                                    status={task.status}
                                />
                            </TableCell>
                            <TableCell>
                                <Button
                                    color="error"
                                    startIcon={<Delete />}
                                    onClick={() => setDeleteDialog({
                                        open: true,
                                        taskId: task._id
                                    })}
                                >
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    </StyledTableContainer>
);

// Create Task Dialog Component
const CreateTaskDialog = ({ createDialog, setCreateDialog, newTask, setNewTask, users, handleCreateTask }) => (
    <Dialog open={createDialog} onClose={() => setCreateDialog(false)}>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
            <TextField
                margin="dense"
                label="Title"
                fullWidth
                required
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <TextField
                margin="dense"
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <TextField
                margin="dense"
                label="Due Date"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            />
            <TextField
                margin="dense"
                label="Assign To"
                select
                fullWidth
                required
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
            >
                {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                        {user.username}
                    </MenuItem>
                ))}
            </TextField>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateTask} variant="contained">
                Create
            </Button>
        </DialogActions>
    </Dialog>
);

// Delete Confirmation Dialog Component
const DeleteConfirmationDialog = ({ deleteDialog, setDeleteDialog, handleDeleteConfirm }) => (
    <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, taskId: null })}
    >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Are you sure you want to delete this task? This action cannot be undone.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, taskId: null })}>
                Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                Delete
            </Button>
        </DialogActions>
    </Dialog>
);

// Notification Component
const Notification = ({ notification, setNotification }) => (
    <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
    >
        <Alert
            onClose={() => setNotification({ ...notification, open: false })}
            severity={notification.severity}
        >
            {notification.message}
        </Alert>
    </Snackbar>
);

export default Admin;
