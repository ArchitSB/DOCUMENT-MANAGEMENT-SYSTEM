const express = require("express");
const cors = require('cors');
require("dotenv").config();

const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const {sequelize} = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

sequelize.authenticate().then(()=>{
    console.log("database connected");
}).catch(error => {
    console.error("Unable to connect to database", error);
});
  
app.post('/folder/create', [
    body('name').isString().notEmpty().withMessage('Name is required and must be a unique string'),
    body('type').isIn(['csv', 'img', 'pdf', 'ppt']).withMessage('Type must be one of [\'csv\', \'img\', \'pdf\', \'ppt\']'),
    body('maxFileLimit').isInt({ gt: 0 }).withMessage('maxFileLimit must be a positive integer')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, maxFileLimit } = req.body;

    // Here you would typically check if the folder name is unique and save the folder to the database
    // For this example, we'll assume the name is unique and return a success response

    const folder = {
        folderId: uuidv4(),
        name,
        type,
        maxFileLimit
    };

    res.status(201).json({
        message: 'Folder created successfully',
        folder
    });
});

const foldersRoute = require('./routes/folders.route');
const fileRoute = require('./routes/file.route');
const filesBySortRoute = require('./routes/filesBySort.route');
const extraRoutes = require('./routes/extraRoutes.route');
app.use('/folders', foldersRoute);
app.use('/folders/:folderId/files', fileRoute);
app.use('/folders/:folderId/filesBySort', filesBySortRoute);
app.use('/', extraRoutes);



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});