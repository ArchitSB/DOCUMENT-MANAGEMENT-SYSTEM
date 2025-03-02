const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const router = express.Router();

// Mock database for demonstration purposes
const folders = [
    { folderId: '04a1018b-5c2b-499a-b999-d4ae81abc1a6', name: 'Sample Folder', type: 'csv', maxFileLimit: 10, files: [] }
];

// Configure multer for file uploads
const upload = multer({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const folder = folders.find(f => f.folderId === req.params.folderId);
        if (!folder) {
            return cb(new Error('Folder does not exist'), false);
        }
        const fileType = file.mimetype.split('/')[1];
        if (fileType !== folder.type) {
            return cb(new Error('File type mismatch'), false);
        }
        cb(null, true);
    }
});

// Upload File Endpoint
router.post('/', upload.single('file'), (req, res) => {
    const { folderId } = req.params;
    const { description } = req.body;

    const folder = folders.find(f => f.folderId === folderId);
    if (!folder) {
        return res.status(404).json({ message: 'Folder does not exist' });
    }

    if (folder.files.length >= folder.maxFileLimit) {
        return res.status(400).json({ message: 'Folder has reached max file limit' });
    }

    const file = {
        fileId: uuidv4(),
        uploadedAt: new Date().toISOString(),
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
        folderId,
        description
    };

    folder.files.push(file);

    res.status(201).json({
        message: 'File uploaded successfully',
        file
    });
});

// Update File Description Endpoint
router.put('/:fileId', [
    body('description').isString().notEmpty().withMessage('Description is required')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { folderId, fileId } = req.params;
    const { description } = req.body;

    const folder = folders.find(f => f.folderId === folderId);
    if (!folder) {
        return res.status(404).json({ message: 'Folder does not exist' });
    }

    const file = folder.files.find(f => f.fileId === fileId);
    if (!file) {
        return res.status(404).json({ message: 'File does not exist in the specified folder' });
    }

    file.description = description;

    res.status(200).json({
        message: 'File description updated successfully',
        file
    });
});

// Delete File Endpoint
router.delete('/:fileId', (req, res) => {
    const { folderId, fileId } = req.params;

    const folder = folders.find(f => f.folderId === folderId);
    if (!folder) {
        return res.status(404).json({ message: 'Folder does not exist' });
    }

    const fileIndex = folder.files.findIndex(f => f.fileId === fileId);
    if (fileIndex === -1) {
        return res.status(404).json({ message: 'File not found in the folder' });
    }

    folder.files.splice(fileIndex, 1);

    res.status(200).json({ message: 'File deleted successfully' });
});

// Get Files in a Folder Endpoint
router.get('/', (req, res) => {
    const { folderId } = req.params;

    const folder = folders.find(f => f.folderId === folderId);
    if (!folder) {
        return res.status(404).json({ message: 'Folder does not exist' });
    }

    res.status(200).json(folder.files);
});


module.exports = router;