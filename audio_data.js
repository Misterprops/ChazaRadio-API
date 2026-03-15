import mongoose from "mongoose";

let cache = null;

export async function audio_data(data, url) {
    const esquema = new mongoose.Schema({
        url: String,
        titulo: String,
        tipo: String,
        id: String,
        likes: { type: Number, default: 0 },
        escuchada: { type: Boolean, default: false },
        autor: String,
        creacion: { type: Date, default: Date.now }
    });

    const audio = mongoose.models.audio || mongoose.model("audio", esquema, "Audios");

    const nuevoAudio = await audio.create({
        url: url,
        titulo: data.titulo,
        tipo: data.tipo,
        id: data.id,
        autor: data.autor
    });
}

export async function get_audios(req, res) {
    if (!cache) {
        const esquema = new mongoose.Schema({
            url: String,
            titulo: String,
            likes: Number,
            autor: String
        });

        const audios = mongoose.models.audios || mongoose.model("audios", esquema, "Audios");

        const page = 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const songs = await audios
            .find()
            .sort({ likes: -1 });

        return res.json(songs)
    } else {
        return res.json(cache)
    }
}

export async function get_sounds(req, res) {
    const esquema = new mongoose.Schema({
        url: String,
        titulo: String,
        likes: Number,
        autor: String,
        escuchada: Boolean
    });

    const sounds = mongoose.models.sounds || mongoose.model("sounds", esquema, "Audios");

    const songs = await sounds
        .find()
        .sort();

    cache = songs.sort((s1, s2) => {
        const noEscuchados = s1.escuchada - s2.escuchada
        if (noEscuchados !== 0) {
            return noEscuchados
        }
        return s2.likes - s1.likes
    })
    console.log(cache[0])
    res.set("Content-Type", "text/plain");
    
    res.send(`annotate:title="${cache[0].titulo}",artist="${cache[0].autor}":${cache[0].url.replace("localhost","host.docker.internal")}`);
}