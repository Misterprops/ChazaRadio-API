import mongoose from "mongoose";
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
}