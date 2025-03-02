const express = require('express');
const router = express.Router();

// Mock database for demonstration purposes
const folders = [
    { folderId: '04a1018b-5c2b-499a-b999-d4ae81abc1a6', name: 'Sample Folder', type: 'csv', maxFileLimit: 10, files: [] }
];

// Get Files in a Folder with Sorting Endpoint
router.get('/', (req, res) => {
    const { folderId } = req.params;
    const { sort } = req.query;

    const folder = folders.find(f => f.folderId === folderId);
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
});

module.exports = router;