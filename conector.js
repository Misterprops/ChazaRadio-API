import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { download } from './download.js';
import { upload } from './upload.js';
import { uploader } from './uploader.js';
import { fetch_audios } from './fetch_audios.js';
import { mail_register } from './mail_register.js';
import { mail_verificar } from './mail_verificar.js';

const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.listen(port, () => {
    console.log(`Servidor Node escuchando en http://localhost:${port}`);
});

app.post('/api/descargar', async (req, res) => { download(req, res) })

app.post('/api/upload', upload(), (req, res) => { uploader(req, res, port) })

//fectch audio
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mediaFolder = path.resolve(__dirname, './media');

// 📁 Asegura que la carpeta exista
if (!fs.existsSync(mediaFolder)) {
    fs.mkdirSync(mediaFolder, { recursive: true });
}

app.use("/media", express.static(path.join(__dirname, "./media")));
const uploadsPath = path.join(__dirname, "./media");

app.get("/audios", (req, res) => { fetch_audios(req, res, uploadsPath, port) })

//mail-sender

function generarCodigo() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

var db = {}
app.post('/api/registro', async (req, res) => {
    const { email, password } = req.body;
    // Guardar usuario con código y expiración de 10 minutos
    db = {
        email,
        password,
        isVerified: false,
        codigo: generarCodigo(),
        codeExpires: Date.now() + 10 * 60 * 1000
    }
    mail_register(db, res)
})

app.post('/api/verificar', async (req, res) => { mail_verificar(req, res, db) });

//database
/*import pkg from 'pg';

const conectar = () => {
    const { Client } = pkg;

    const connectionData = {
        user: 'postgres',
        host: 'localhost',
        database: 'RadioChaza',
        password: '123',
        port: 5432,
    }
    const client = new Client(connectionData)
    client.connect()
    return client
}

app.post('/api/user_data', async (req, res) => {
    const { user } = req.body;
    const client = conectar()
    client.query(`select usuarios.user, usuarios.mail from usuarios where usuarios.user = '${user}'`)
        .then(response => {
            const userData = response.rows[0];

            client.end();

            if (response.rows === undefined) return res.status(400).json({ error: 'Usuario inválido' });
            res.json(userData)
        })
        .catch(err => {
            console.log(err)
            client.end()
        })
});

app.post('/api/login', async (req, res) => {
    const { user, password } = req.body;
    const client = conectar()
    client.query(`select usuarios.user, usuarios.validado, usuarios.password from usuarios where usuarios.user = '${user}'`)
        .then(response => {
            const userData = response.rows[0];

            client.end();

            if (response.rows === undefined) return res.status(400).json({ error: 'Usuario inválido' });
            if (!userData.validado) return res.status(400).json({ error: 'Usuario no activo' });
            if (password != userData.password) return res.status(400).json({ error: 'Contraseña incorrecta' });
            res.json({ user: userData.user })
        })
        .catch(err => {
            console.log(err)
            client.end()
        })
});*/