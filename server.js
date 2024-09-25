import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

dotenv.config();
const env = process.env;

mongoose.connect(env.MONGO_URI)
    .then(() => console.log('DB connected!'))
    .catch((err) => console.log('Error connecting DB!', err));

const app = express();

app.use(cors({
    origin: 'https://image-uploader.lampe-kevin.com',
    credentials: true
}));


cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
});

const imageSchema = new mongoose.Schema({
    url: String,
    public_id: String
});

const Image = mongoose.model('Image', imageSchema);

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads',
        allowed_formats: [ 'jpg', 'png' ]
    }
});

const upload = multer({ storage });

app.post('/images', upload.single('file'), async (req, res) => {
    const newImage = new Image({
        url: req.file.path,
        public_id: req.file.filename
    });

    const savedImage = await newImage.save();

    res.json({ message: 'Image successful saved!',
        image: savedImage });
});

app.get('/images', async (req, res) => {
    const images = await Image.find();

    res.json(images);
});


app.listen(env.PORT, () =>
    console.log(`Server started on PORT ${env.PORT}`));