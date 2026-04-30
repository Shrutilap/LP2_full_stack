require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Student = require('./models/Student');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ Student Database Connected'))
.catch(err => console.error('❌ Connection Error:', err));

// API Routes

// Get all students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create student
app.post('/api/students', async (req, res) => {
    const student = new Student(req.body);
    try {
        const newStudent = await student.save();
        console.log('✅ Student saved:', newStudent.rollNo);
        res.status(201).json(newStudent);
    } catch (err) {
        console.error('❌ Error saving student:', err.message);
        res.status(400).json({ message: err.message });
    }
});

// Update student
app.put('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json(student);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete student
app.delete('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json({ message: 'Record deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Student App running on http://localhost:${PORT}`);
});
