const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { Folder } = require('../models'); // Import the Folder model

const router = express.Router();

// Update Folder Endpoint
router.put('/:folderId', [
    body('name').optional().isString().notEmpty().withMessage('Name must be a unique string'),
    body('maxFileLimit').optional().isInt({ gt: 0 }).withMessage('maxFileLimit must be a positive integer')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { folderId } = req.params;
    const { name, maxFileLimit } = req.body;

    try {
        // Find the folder by folderId
        const folder = await Folder.findByPk(folderId);
        if (!folder) {
            return res.status(404).json({ message: 'Invalid folderId' });
        }

        // Update the folder fields
        if (name) folder.name = name;
        if (maxFileLimit) folder.maxFileLimit = maxFileLimit;
        await folder.save();

        res.status(200).json({
            message: 'Folder updated successfully',
            folder
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Get Folder Endpoint
router.get('/:folderId', async (req, res) => {
    const { folderId } = req.params;

    try {
        // Find the folder by folderId
        const folder = await Folder.findByPk(folderId);
        if (!folder) {
            return res.status(404).json({ message: 'Invalid folderId' });
        }

        res.status(200).json({
            message: 'Folder retrieved successfully',
            folder
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Delete Folder Endpoint
router.delete('/:folderId', async (req, res) => {
    const { folderId } = req.params;

    try {
        // Find the folder by folderId
        const folder = await Folder.findByPk(folderId);
        if (!folder) {
            return res.status(404).json({ message: 'Invalid folderId' });
        }

        await folder.destroy();

        res.status(200).json({ message: 'Folder deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Get All Folders Endpoint
router.get('/', async (req, res) => {
    try {
        const folders = await Folder.findAll();
        res.status(200).json(folders);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});

module.exports = router;