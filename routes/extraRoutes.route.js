const express = require('express');
const router = express.Router();

// Mock database for demonstration purposes
const folders = [
    { folderId: '04a1018b-5c2b-499a-b999-d4ae81abc1a6', name: 'Sample Folder', type: 'csv', maxFileLimit: 10, files: [] }
];

// Get Files by Type Across Folders Endpoint
router.get('/files', (req, res) => {
    const { type } = req.query;

    const files = folders.flatMap(folder => 
        folder.files.filter(file => file.type === `application/${type}`)
    );

    res.status(200).json({ files });
});

// Get File Metadata Endpoint
router.get('/folders/:folderId/files/metadata', (req, res) => {
    const { folderId } = req.params;

    const folder = folders.find(f => f.folderId === folderId);
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
});

module.exports = router;