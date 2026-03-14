import mongoose from "mongoose";

export const upload_poadcast = async (req, res) => {

    const esquema = new mongoose.Schema({
        nombre: String,
        autores: String,
        capitulo: [{
            creacion: { type: Date, default: Date.now },
            url: String
        }]
    });

    const Poadcast = mongoose.models.poadcast || mongoose.model("poadcast", esquema, "Poadcasts");

    try {
        await Poadcast.updateOne(
            { nombre: req.body.serie }, // busca la serie
            {
                $setOnInsert: {
                    nombre: req.body.serie,
                    autores: req.body.autores
                },
                $push: {
                    capitulo: {
                        url: req.body.url
                    }
                }
            },
            { upsert: true } // si no existe la crea
        );
        res.json({ status: "ok" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export async function get_poadcasts(req, res) {
    const esquema = new mongoose.Schema({
        nombre: String,
        autores: String,
        capitulo: [{
            creacion: { type: Date, default: Date.now },
            url: String
        }]
    });

    const poadcasts = mongoose.models.poadcasts || mongoose.model("poadcasts", esquema, "Poadcasts");

    const page = 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const audios = await poadcasts
        .find()
        .sort({ nombre: 1 });

    return res.json(audios)
}