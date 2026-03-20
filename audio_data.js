import mongoose from "mongoose";
import { cacheServices } from "./cacheServices.js";

let cache = {
    data: null,
    ttl: 180000,
    lastTtl: Date.now()
}
let sonando = null;
let currentPromise = null
let pendingResponses = []
let historial = []

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
    if (!cacheServices(cache)) {
        console.log("BUSCANDOO")
        await search_audios()
    }
    return res.json(cache.data)
}

export async function get_sounds(req, res) {
    // Guardar la respuesta en cola
    pendingResponses.push(res)

    // Si ya hay ejecución en curso, salir
    if (currentPromise) return

    // Crear una única ejecución
    currentPromise = (async () => {
        try {
            await updater()
            const responseText =
                `annotate:title="${sonando.titulo}",artist="${sonando.autor}":${sonando.url.replace("localhost", "host.docker.internal")}`


            // Responder a TODOS los requests acumulados
            pendingResponses.forEach(r => {
                r.set("Content-Type", "text/plain")
                r.send(responseText)
            })

        } finally {
            // limpiar estado
            pendingResponses = []
            currentPromise = null
        }
    })()
}

const search_audios = async () => {
    const esquema = new mongoose.Schema({
        url: String,
        titulo: String,
        likes: Number,
        autor: String,
        escuchada: Boolean
    });

    const audios = mongoose.models.audios || mongoose.model("audios", esquema, "Audios");

    const songs = await audios.find();

    if (songs.every(s => historial.includes(s._id.toString()))) {
        historial = [] // reset inteligente
    }

    cache.data = songs.sort((s1, s2) => {
        const h1 = historial.includes(s1._id.toString())
        const h2 = historial.includes(s2._id.toString())

        // 1. Historial al final
        if (h1 !== h2) {
            return h1 ? 1 : -1
        }

        if (s1.escuchada !== s2.escuchada) {
            return s1.escuchada ? 1 : -1
        }
        return s2.likes - s1.likes
    })
    cache.lastTtl = Date.now()
}

const update_audio = async () => {

    if (sonando) {
        const esquema = new mongoose.Schema({
            escuchada: Boolean
        });

        const update = mongoose.models.update || mongoose.model("update", esquema, "Audios");

        await update.findByIdAndUpdate(
            sonando._id,
            { $set: { escuchada: true } }
        )
    }
}

const updater = async () => {
    await search_audios()
    cache.data[0] ? sonando = cache.data[0] : "";
    cache.data[0].escuchada ? historial.push(cache.data[0]._id.toString()) : await update_audio()
}


export const likeContador = async (url, inc) => {
    if (!cacheServices(cache)) {
        await search_audios()
    }
    const esquema = new mongoose.Schema({
        likes: Number
    });

    const likes = mongoose.models.likes || mongoose.model("likes", esquema, "Audios");

    const res = await likes.updateOne(
        { url: url },
        { $inc: { likes: inc } }
    )

    const audio = cache.data.find(a => a.url === url);
    if (audio) {
        audio.likes += inc;
    }
}