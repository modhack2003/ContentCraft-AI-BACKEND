const express = require('express');
const multer = require('multer');
const path = require('path');
const { getAIResponse } = require('../helpers/googleGenerativeAI');
const cloudinary = require("cloudinary").v2;
const fs = require('fs');

const router = express.Router();

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

router.post('/create', upload.single('file'), async (req, res) => {
  const { consultationType, consultationDetails } = req.body;
  const file = req.file;

  try {
    let fileUrl = '';

    if (file) {
      fileUrl = await uploadToCloudinary(file.path);
      console.log(`Processed file ${file.filename} to Cloudinary: ${fileUrl}`);
    }

    const prompt = `
    Consultation Request:
    Type: ${consultationType}
    Details: ${consultationDetails}
    file: ${fileUrl}
    Please proceed with the consultation based on the above information.
    `;
    
    

    console.log('Received request to consult with prompt:', prompt);

    const aiResponse = await getAIResponse(prompt);

    console.log('Generated AI response:', aiResponse);

    res.json({ response: aiResponse, fileUrl });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
