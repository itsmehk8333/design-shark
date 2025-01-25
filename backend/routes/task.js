const express = require('express');
const router = express.Router();
const Task = require('../models/Tasks');
const auth = require('../middleware/auth.js');

// Admin Routes
router.post('/', auth, async (req, res) => {
    try {
        
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const task = new Task({
            ...req.body,
            createdBy: req.user.id
        });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all tasks (Admin only)
router.get('/admin/tasks', auth, async (req, res) => {
    console.log(25)
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const tasks = await Task.find({ createdBy: req.user.id })
            .populate('assignedTo', 'username email')
            .populate('createdBy', 'username email');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// User Routes
router.get('/my-tasks', auth, async (req, res) => {
    try {
        //  console.log(auth)    
        const tasks = await Task.find({assignedTo: req.user.id})
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update task status (User can update only their tasks)
router.patch('/:id', auth, async (req, res) => {
    try {
         console.log(52)
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        if (task.assignedTo.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        task.status = req.body.status;
        await task.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete task (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
         console.log(69)
          console.log(req.params)
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;