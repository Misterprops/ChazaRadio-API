import multer from 'multer';
import { fileURLToPath } from 'url';
import fs from 'fs'
import path from 'path';

// 🧭 Rutas relativas para carpeta media
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mediaFolder = path.resolve(__dirname, './media');

// 📁 Asegura que la carpeta exista
if (!fs.existsSync(mediaFolder)) {
    fs.mkdirSync(mediaFolder, { recursive: true });
}

//uploader
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, mediaFolder),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
export const upload = () => {
    let upload_middleware = multer({ storage });
    return upload_middleware.single('audio');
}