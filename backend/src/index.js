const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const authRoutes = require('./routes/authRoutes');

const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : null;
app.use(cors({
    origin: allowedOrigins || '*',
    credentials: true
}));
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('Job Connect API is running');
});

// Routes
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Serve uploaded files
app.use('/api/auth', authRoutes);
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
    }
    if (err.message === 'Only PDF files are allowed for resume!' || err.message === 'Only images are allowed for profile picture!') {
        return res.status(400).json({ message: err.message });
    }
    // Return actual error message for debugging
    res.status(500).json({ message: err.message || 'Internal Server Error' });
});
