import { getPosts, uploadPost } from "./database/esquemas.js";
export async function upload_post(req, res) {
    try {
        const tipo = req.body.link.includes("youtube") ? "video" : req.body.link === "" ? "vacio" : "imagen"
        await uploadPost.create({
            id: req.user.id,
            mensaje: req.body.mensaje,
            link: req.body.link,
            nombre: req.user.nombre,
            tipo: tipo
        });
        res.json({ status: "ok" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function get_posts(req, res) {
    const page = req.body.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const publicaciones = await getPosts
        .find()
        .sort({ creacion: -1 })
        .skip(skip)
        .limit(limit);

    return res.json(publicaciones)
}

export async function delete_post(req, res) {
    try {
        const post = await getPosts.findById({_id: req.body.postId});
        if(!post || post.id !== req.user.id){
            res.status(403).json({ error: "No autorizado para eliminar este post" });
        }
        await getPosts.findByIdAndUpdate({_id: req.body.postId}, {enabled: false});
        res.json({ status: "ok" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}