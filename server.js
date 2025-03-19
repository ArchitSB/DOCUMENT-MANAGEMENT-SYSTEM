const express = require("express");
const cors = require('cors');
require("dotenv").config();

const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { sequelize, Folder } = require('./models'); 

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
sequelize.authenticate().then(() => {
    console.log("database connected");
}).catch(error => {
    console.error("Unable to connect to database", error);
});

// Import Routes
const foldersRoute = require('./routes/folders.route');
const fileRoute = require('./routes/file.route');
const filesBySortRoute = require('./routes/filesBySort.route');
const extraRoutes = require('./routes/extraRoutes.route');

// Route Configuration
app.use('/folders', foldersRoute);
app.use('/folders/:folderId/files', fileRoute);
app.use('/folders/:folderId/filesBySort', filesBySortRoute);
app.use('/', extraRoutes);

// Create Folder Endpoint
app.post('/folder/create', [
    body('name').isString().notEmpty().withMessage('Name is required and must be a unique string'),
    body('type').isIn(['csv', 'img', 'pdf', 'ppt']).withMessage('Type must be one of [\'csv\', \'img\', \'pdf\', \'ppt\']'),
    body('maxFileLimit').isInt({ gt: 0 }).withMessage('maxFileLimit must be a positive integer')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, maxFileLimit } = req.body;

    try {
        const existingFolder = await Folder.findOne({ where: { name } });
        if (existingFolder) {
            return res.status(400).json({ message: 'Folder name must be unique' });
        }

        const folder = await Folder.create({
            folderId: uuidv4(),
            name,
            type,
            maxFileLimit
        });

        res.status(201).json({
            message: 'Folder created successfully',
            folder
        });
    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Error Handler Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});