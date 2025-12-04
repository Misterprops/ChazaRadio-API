import { fileURLToPath } from 'url';
import { execa } from 'execa';
import ffmpeg from 'ffmpeg-static';
import ytdlp from 'yt-dlp-exec';
import fs from 'fs'
import path from 'path';

export const download = async (req, res) => {
    // 🧭 Rutas relativas para carpeta media
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const mediaFolder = path.resolve(__dirname, './media');

    // 📁 Asegura que la carpeta exista
    if (!fs.existsSync(mediaFolder)) {
        fs.mkdirSync(mediaFolder, { recursive: true });
    }
    
    console.log('📂 __dirname:', __dirname);
    console.log('📂 mediaFolder:', mediaFolder);
    console.log('📂 cwd:', process.cwd());
    const { url } = req.body;
    if (!url) {
        console.log("❌ Error: Debes proporcionar una URL de YouTube.");
        return;
    }

    try {
        /*const outputPath = path.join(mediaFolder, '%(title)s.%(ext)s');

        const result = await ytdlp(url, {
            extractAudio: true,
            audioFormat: 'mp3',
            output: outputPath,
        });*/
        const info = await ytdlp(url, {
            dumpSingleJson: true,
            noWarnings: true,
            preferFreeFormats: true,
            noCheckCertificate: true,
        });

        const title = info.title;
        const outputPath = path.join(mediaFolder, `${title}.webm`);
        const finalAudioPath = path.join(mediaFolder, `${title}.mp3`);

        await ytdlp(url, {
            format: 'bestaudio',
            output: outputPath
        });

        await execa(ffmpeg, [
            '-i', outputPath,
            '-vn',
            '-acodec', 'libmp3lame',
            '-ab', '192k',
            finalAudioPath,
        ]);
        fs.unlinkSync(outputPath);

        console.log('✅ Descarga terminada en:', mediaFolder);
        res.status(200).json({ message: 'Descarga completa' });
    } catch (err) {
        console.error('❌ Error durante la descarga:', err);
        res.status(500).json({ error: 'Fallo al descargar audio' });
    }
}