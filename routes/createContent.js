const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getAIResponse } = require('../helpers/googleGenerativeAI');
const cloudinary = require("cloudinary").v2;
const fs = require('fs'); // Use native fs module

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadDirectory = path.join(__dirname, '..', 'uploads');

// Ensure the upload directory exists synchronously
try {
  fs.statSync(uploadDirectory);
} catch (err) {
  if (err.code === 'ENOENT') {
    // Create the directory if it doesn't exist
    fs.mkdirSync(uploadDirectory, { recursive: true });
  } else {
    throw err;
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

async function uploadToCloudinary(filePath) {
  try {
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    console.log(`Uploaded file ${uploadResult.original_filename} to Cloudinary`);

    // Delete the file from the server after successful upload to Cloudinary
    await fs.promises.unlink(filePath);
    console.log(`Deleted file ${filePath} from the server`);

    return uploadResult.secure_url;
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    throw error;
  }
}

router.post('/create', upload.array('files', 10), async (req, res) => {
  const { contentType, title } = req.body;
  const files = req.files || []; // Initialize files as an empty array if req.files is undefined

  try {
    if (!contentType || !title) {
      throw new Error('Missing contentType or title');
    }

    const imageUrls = [];
    if (files.length > 0) {
      const filePromises = files.map(async (file) => {
        try {
          const url = await uploadToCloudinary(file.path);
          console.log(`Processed file ${file.filename} to Cloudinary: ${url}`);
          imageUrls.push(url);
        } catch (error) {
          console.error('Error processing file:', error);
          throw error;
        }
      });

      await Promise.all(filePromises);
    }

    const prompt = `Generate content of type "${contentType}" with the title "${title}"`;

    console.log('Received request to create content with prompt:', prompt);

    const aiResponse = await getAIResponse(prompt);

    console.log('Generated AI response:', aiResponse);

    res.json({ reply: aiResponse, files });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
