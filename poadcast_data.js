import mongoose from "mongoose";
import { poadcast, user } from "./database/esquemas.js";

export const upload_poadcast = async (req, res) => {
    try {
        if (await poadcast_creator(req.user.id, req.body.serie)) {
            await poadcast.updateOne(
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
        }else{
            res.status(500).json({error: "Usuario no coincide con id de creador"})
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};

const poadcast_creator = async (id, nombre) => {
    const autor = await poadcast.findOne(
        { nombre: nombre },
        { id: 1, nombre: 1, _id: 0 }
    )
    if (id !== autor.id) return false
    if (nombre !== autor.nombre) return false
    return true;
}

export async function get_poadcasts(req, res) {

    const poadcasts = await poadcast
        .find()
        .sort({ nombre: 1 });

    return res.json(poadcasts)
}