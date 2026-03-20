import express from 'express';
import cors from 'cors';
import multer from "multer";
import dotenv from "dotenv";
//import { download } from './download.js';
import { upload } from './upload.js';
import { mail_verificar } from './mail_verificar.js';
import { conectardb } from './conectordb.js';
import { user_data, user_login, user_register } from './user_data.js';
import { get_posts, upload_post } from './upload_post.js';
import { get_audios, get_sounds } from './audio_data.js';
import { get_poadcasts, upload_poadcast } from './poadcast_data.js';
import { get_likeList, likeControl } from './like_control.js';

const app = express();
dotenv.config();

const port = process.env.PORT || 3000;
const uri = process.env.URI || "mongodb://localhost:27017/ChazaRadio";

app.use(cors());
app.use(express.json());

app.listen(port, () => {
    console.log(`Servidor Node escuchando en http://localhost:${port}`);
});

//LOCAL ONLY
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from './tokenServices.js';

//fectch audio
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mediaFolder = path.resolve(__dirname, './media');

// 📁 Asegura que la carpeta exista
if (!fs.existsSync(mediaFolder)) {
    fs.mkdirSync(mediaFolder, { recursive: true });
}

app.use("/media", express.static(path.join(__dirname, "./media")));
//LOCAL ONLY

const uploader = multer();

app.post("/api/upload", uploader.single("audio"), async (req, res) => { upload(req, res) }); // Revisar upload en blob

app.post('/api/registro', async (req, res) => { user_register(req, res) });

app.post('/api/verificar', async (req, res) => { mail_verificar(req, res) });

await conectardb(uri)

app.post('/api/user_data', authenticateToken, async (req, res) => { user_data(req, res) });

app.get("/api/verify", authenticateToken, (req, res) => {
    res.json({ valid: true })
})

app.post('/api/login', async (req, res) => { user_login(req, res) });

app.post("/api/upload_post", async (req, res) => { upload_post(req, res) });

app.post("/api/get_posts", async (req, res) => { get_posts(req, res) }); // Revisar para cache de 50 aprox y nuevos campos: lastSeen y LastPage

app.post("/api/get_audios", async (req, res) => { get_audios(req, res) });

app.post("/api/like_control", authenticateToken, async (req, res) => { likeControl(req, res) })

app.post("/api/get_likeList", authenticateToken, async (req, res) => { get_likeList(req, res) })

app.get("/api/get_sounds", async (req, res) => { get_sounds(req, res) });

app.post("/api/upload_poadcast", async (req, res) => { upload_poadcast(req, res) }); // Revisar para cache automatico

app.post("/api/get_poadcast", async (req, res) => { get_poadcasts(req, res) }); // Revisar rastreo de id