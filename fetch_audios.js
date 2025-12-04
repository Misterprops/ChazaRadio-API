import fs from 'fs';
export const fetch_audios = (req, res, uploadsPath, port) =>{
    fs.readdir(uploadsPath, (err, files) => {
        if (err) return res.status(500).send("Error leyendo archivos");

        const audios = files
            .filter(f => f.endsWith(".mp3"))
            .map(f => `http://localhost:${port}/media/${f}`);

        res.json(audios);
    });
}