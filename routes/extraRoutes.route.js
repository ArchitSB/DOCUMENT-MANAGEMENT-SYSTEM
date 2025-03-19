const express = require('express');
const router = express.Router();
const { Folder, File } = require('../models'); // Import the models

// Get Files by Type Across Folders Endpoint
router.get('/files', async (req, res) => {
    const { type } = req.query;

    try {
        const files = await File.findAll({
            where: {
                type: `application/${type}`
            }
        });

        res.status(200).json({ files });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Get File Metadata Endpoint
router.get('/folders/:folderId/files/metadata', async (req, res) => {
    const { folderId } = req.params;

    try {
        const folder = await Folder.findByPk(folderId, {
            include: [{ model: File, as: 'files' }]
        });
        if (!folder) {
            return res.status(404).json({ message: 'Folder does not exist' });
        }

        const filesMetadata = folder.files.map(file => ({
            fileId: file.fileId,
            name: file.name,
            size: file.size,
            description: file.description
        }));

        res.status(200).json({ files: filesMetadata });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});

module.exports = router;