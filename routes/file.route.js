require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { v4: uuidv4 } = require('uuid');
const { Folder, File } = require('../models');
const fs = require('fs');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Create an 'uploads' folder in your project directory
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname + '-' + Date.now());
    }
});

const upload = multer({ storage: storage });

// Upload File Endpoint
router.post('/', upload.single('file'), async (req, res) => {
    const { folderId } = req.params;
    const { description } = req.body;

    try {
        const folder = await Folder.findOne({ where: { folderId } });
        if (!folder) {
            return res.status(404).json({ message: 'Folder does not exist' });
        }

        const fileCount = await File.count({ where: { folderId } });
        if (fileCount >= folder.maxFileLimit) {
            return res.status(400).json({ message: 'Folder has reached max file limit' });
        }

        // Upload the file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'dms', // Optional: Cloudinary folder to store files
            public_id: req.file.filename // Use the original filename as the public ID
        });

        // Create a new file record in the database
        const file = await File.create({
            fileId: uuidv4(),
            uploadedAt: new Date().toISOString(),
            name: req.file.originalname,
            type: req.file.mimetype,
            size: req.file.size,
            folderId,
            description,
            url: result.secure_url, // Save the Cloudinary URL
            publicId: result.public_id // Save the Cloudinary public ID
        });

        // Remove the file from local storage
        fs.unlinkSync(req.file.path);

        res.status(201).json({
            message: 'File uploaded successfully',
            file
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Update File Description Endpoint
router.put('/:fileId', [
    body('description').isString().notEmpty().withMessage('Description is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { folderId, fileId } = req.params;
    const { description } = req.body;

    try {
        const folder = await Folder.findByPk(folderId);
        if (!folder) {
            return res.status(404).json({ message: 'Folder does not exist' });
        }

        const file = await File.findOne({ where: { fileId, folderId } });
        if (!file) {
            return res.status(404).json({ message: 'File does not exist in the specified folder' });
        }

        file.description = description;
        await file.save();

        res.status(200).json({
            message: 'File description updated successfully',
            file
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Delete File Endpoint
router.delete('/:fileId', async (req, res) => {
    const { folderId, fileId } = req.params;

    try {
        const folder = await Folder.findByPk(folderId);
        if (!folder) {
            return res.status(404).json({ message: 'Folder does not exist' });
        }

        const file = await File.findOne({ where: { fileId, folderId } });
        if (!file) {
            return res.status(404).json({ message: 'File not found in the folder' });
        }

        // Delete the file from Cloudinary
        await cloudinary.uploader.destroy(file.publicId);

        await file.destroy();

        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Get Files in a Folder Endpoint
router.get('/', async (req, res) => {
    const { folderId } = req.params;

    try {
        const folder = await Folder.findByPk(folderId);
        if (!folder) {
            return res.status(404).json({ message: 'Folder does not exist' });
        }

        const files = await File.findAll({ where: { folderId } });

        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});

module.exports = router;