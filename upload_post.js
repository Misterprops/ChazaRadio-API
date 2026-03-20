import mongoose from "mongoose";
export async function upload_post(req, res) {
    const esquema = new mongoose.Schema({
        id: String,
        mensaje: String,
        link: String,
        nombre: String,
        creacion: { type: Date, default: Date.now }
    });

    const post = mongoose.models.post || mongoose.model("post", esquema, "Posts");

    const nuevoPost = await post.create({
        id: req.body.id,
        mensaje: req.body.mensaje,
        link: req.body.link,
        nombre: req.body.nombre
    });

    return res.json(nuevoPost)
}

export async function get_posts(req, res) {
    const esquema = new mongoose.Schema({
        mensaje: String,
        link: String,
        nombre: String,
        tipo: String
    });

    const posts = mongoose.models.posts || mongoose.model("posts", esquema, "Posts");

    const page = req.body.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const publicaciones = await posts
        .find()
        .sort({ creacion: -1 })
        .skip(skip)
        .limit(limit);

    return res.json(publicaciones)
}