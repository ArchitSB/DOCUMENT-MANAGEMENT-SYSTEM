const express = require('express');
const router = express.Router();
const { Folder, File } = require('../models'); // Import the models

// Get Files in a Folder with Sorting Endpoint
router.get('/folders/:folderId/filesBySort', async (req, res) => {
    const { folderId } = req.params;
    const { sort } = req.query;

    try {
        const folder = await Folder.findByPk(folderId, {
            include: [{ model: File, as: 'files' }]
        });
        if (!folder) {
            return res.status(404).json({ message: 'Folder does not exist' });
        }

        let files = folder.files;

        if (sort === 'size') {
            files = files.sort((a, b) => a.size - b.size);
        } else if (sort === 'uploadedAt') {
            files = files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        }

        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});

module.exports = router;