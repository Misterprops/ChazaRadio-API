import mongoose from "mongoose";
import { likeContador } from "./audio_data.js";
import { cacheServices } from "./cacheServices.js";

let cache = {
    data: null,
    ttl: 180000,
    lastTtl: Date.now()
}

export async function likeControl(req, res) {
    const esquema = new mongoose.Schema({
        url: String,
        id: String
    });

    const like = mongoose.models.like || mongoose.model("like", esquema, "LikeList");

    try {
        const existe = await like.findOne({
            url: req.body.url,
            id: req.user.id
        });

        if (!existe) {
            await like.create({
                url: req.body.url,
                id: req.user.id
            });

            await likeContador(req.body.url, 1)

            if (cache.data) {
                cache.data.push({
                    url: req.body.url,
                    id: req.user.id
                });
            }
        } else {
            const result = await like.deleteOne({
                url: req.body.url,
                id: req.user.id
            });

            if (result.deletedCount > 0) {
                await likeContador(req.body.url, -1)
                if (cache.data) {
                    cache.data = cache.data.filter(
                        a => !(a.url === req.body.url && a.id === req.user.id)
                    );
                }
            }


        }
        return res.json(await likeList(req.user.id))
    } catch (error) {
        console.log(error)
    }
}

export async function get_likeList(req, res) {
    try {
        return res.json(await likeList(req.user.id))
    } catch (error) {
        console.log(error)
    }
}

const likeList = async (id) => {
    if (!cacheServices(cache)) {
        const esquema = new mongoose.Schema({
            url: String,
            id: String
        });

        const likeList = mongoose.models.likeList || mongoose.model("likeList", esquema, "LikeList");

        cache.data = await likeList.find();

        cache.lastTtl = Date.now()
    }
    const res = cache.data
        .filter(a => a.id === id)
        .map(a => a.url);
    return res
}