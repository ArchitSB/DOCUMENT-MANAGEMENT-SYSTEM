const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Mock database for demonstration purposes
const folders = [
    { folderId: '04a1018b-5c2b-499a-b999-d4ae81abc1a6', name: 'Sample Folder', type: 'csv', maxFileLimit: 10 }
];

// Update Folder Endpoint
router.put('/:folderId', [
    body('name').optional().isString().notEmpty().withMessage('Name must be a unique string'),
    body('maxFileLimit').optional().isInt({ gt: 0 }).withMessage('maxFileLimit must be a positive integer')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { folderId } = req.params;
    const { name, maxFileLimit } = req.body;

    // Find the folder by folderId
    const folder = folders.find(f => f.folderId === folderId);
    if (!folder) {
        return res.status(404).json({ message: 'Invalid folderId' });
    }

    // Update the folder fields
    if (name) folder.name = name;
    if (maxFileLimit) folder.maxFileLimit = maxFileLimit;

    res.status(200).json({
        message: 'Folder updated successfully',
        folder
    });
});

// Get Folder Endpoint
router.get('/:folderId', (req, res) => {
    const { folderId } = req.params;

    // Find the folder by folderId
    const folder = folders.find(f => f.folderId === folderId);
    if (!folder) {
        return res.status(404).json({ message: 'Invalid folderId' });
    }

    res.status(200).json({
        message: 'Folder retrieved successfully',
        folder
    });
});

// Delete Folder Endpoint
router.delete('/:folderId', (req, res) => {
    const { folderId } = req.params;

    // Find the folder by folderId
    const folderIndex = folders.findIndex(f => f.folderId === folderId);
    if (folderIndex === -1) {
        return res.status(404).json({ message: 'Invalid folderId' });
    }

    // Remove the folder from the mock database
    folders.splice(folderIndex, 1);

    res.status(200).json({ message: 'Folder deleted successfully' });
});

// Get All Folders Endpoint
router.get('/', (req, res) => {
    res.status(200).json(folders);
});

module.exports = router;