/*import multer from 'multer';
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
}*/

import { audio_data } from "./audio_data.js";
import { storageService } from "./storageServices.js";



export async function upload(req, res) {
    try {
        await storageService.save(req.file.buffer, req.file.originalname);

        const url = storageService.getUrl(req.file.originalname);

        audio_data(JSON.parse(req.body.data), url)
        res.json({ url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
