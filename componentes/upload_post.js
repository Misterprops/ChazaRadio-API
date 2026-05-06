import { getPosts, uploadPost } from "../database/esquemas.js";

/**
 * Crea una nueva publicación en la red social.
 * 
 * @async
 * @function upload_post
 * 
 * @param {Request} req - Objeto Request de Express
 * @param {string} req.body.link - Url del contenido
 * @param {string} req.body.mensaje - Mensaje del post
 * @param {Object} req.user - Usuario autenticado (JWT decodificado)
 * @param {string} req.user.id - ID del usuario
 * @param {string} req.user.nombre - Nombre del usuario
 * @param {Response} res - Objeto Response de Express
 * 
 * @returns {Response} Respuesta HTTP:
 * - 200: Post subido correctamente
 * - 400: Datos invalidos (validarUploadPost)
 * - 500: Error interno del servidor
 * 
 * @sideEffects
 * - Actualiza DB
 * 
 * @dependencies
 * - Revisar esquema uploadPost
 * - Revisar funcion externa autenticateToken()
 * - Revisar constante externa validarUploadPost
 *
 * @description
 * - Verifica el tipo de url:
 *   - Video: Si la url es de youtube
 *   - Imagen: Si hay url y este no es de youtube
 *   - Vacio: Si no hay url
 * - Registra el post en la base de datos
 */
export async function upload_post(req, res) {
    try {
        //Verifica si el link tiene una url
        const link = req.body.link || "";

        //Asigna el tipo vacio en caso de que no exista una url
        let tipo = "vacio";
        if (link) {
            //Si existe la url y esta es de youtube, le asigna el tipo video
            if (link.includes("youtube") || link.includes("youtu.be")) {
                tipo = "video";
            } else {
                //Si no, asigna el tipo imagen
                tipo = "imagen";
            }
        }

        //Crea el post en la base de datos
        await uploadPost.create({
            id: req.user.id,
            mensaje: req.body.mensaje,
            link: link,
            nombre: req.user.nombre,
            tipo: tipo
        });
        res.status(200).json({ msg: "Post publicado" });
    } catch (err) {
        res.status(500).json({ error: "Error al publicar el post" });
    }
}

/**
 * Elimina una publicación.
 * 
 * @async
 * @function delete_post
 * 
 * @param {Request} req - Objeto Request de Express
 * @param {string} req.body.postId - ID del post
 * @param {Object} req.user - Usuario autenticado (JWT decodificado)
 * @param {string} req.user.id - ID del usuario
 * @param {Response} res - Objeto Response de Express
 * 
 * @returns {Response} Respuesta HTTP:
 * - 200: Post eliminado correctamente
 * - 400: Datos invalidos (validarDeletePost)
 * - 403: Usuario no autorizado
 * - 500: Error interno del servidor
 * 
 * @security
 * - Solo autor puede eliminar
 * 
 * @sideEffects
 * - Actualiza DB
 * 
 * @dependencies
 * - Revisar esquema getPosts
 * - Revisar funcion externa autenticateToken()
 * - Revisar constante externa validarDeletePost
 *
 * @description
 * - Verifica la existencia del post
 * - Verifica que el dueño del post sea el usuaio
 * - Deshabilita el post
 */
export async function delete_post(req, res) {
    try {
        //Busca el post por su ID
        const post = await getPosts.findById({ _id: req.body.postId });
        if (!post || post.id !== req.user.id) {
            //Si el post no existe o el usuario no es el creador, no lo deshabilita
            return res.status(403).json({ error: "No autorizado para eliminar este post" });
        }
        //Deshabilita el post
        await getPosts.findByIdAndUpdate({ _id: req.body.postId }, { enabled: false });
        res.status(200).json({ status: "Post eliminado" });
    } catch (err) {
        res.status(500).json({ error: "Error al borrar el post" });
    }
}

/**
 * Obtiene publicaciones paginadas.
 * 
 * @async
 * @function get_posts
 * 
 * @param {Request} req - Objeto Request de Express
 * @param {string} req.body.page - Numero de pagina del listado de posts
 * @param {Object} res - Objeto Response de Express
 * 
 * @returns {Promise<Array>} Sublista de posts (Fijado a 10 posts)
 * @returns {Response} Respuesta HTTP:
 * - 200: Sublista de posts
 * - 400: Datos invalidos (validarGetPosts)
 * - 500: Error interno del servidor
 * 
 * @dependencies
 * - Revisar esquema getPosts
 * - Revisar constante externa validarGetPosts
 *
 * @description
 * - Devuelve una lista de 10 posts
 * - La lista va desde (Numero de pagina - 1) * limite
 * - La pagina por defecto es 1
 */
export async function get_posts(req, res) {
    try {
        //Numero de pagina de posts
        const page = Number(req.body.page) || 1;
        //Limite de posts por pagina
        const limit = 10;
        //Posts ya obtenidos
        const skip = (page - 1) * limit;

        //Obtiene la sublista de posts
        const publicaciones = await getPosts
            //Busca solo posts habilitados
            .find({ enabled: true })
            //Ordena por fecha de creacion descendente
            .sort({ creacion: -1 })
            //Salta los que ya se han obtenido
            .skip(skip)
            //Trae posts hasta el limite
            .limit(limit);

        return res.json(publicaciones);
    } catch (err) {
        return res.status(500).json({ error: "Error al obtener los posts" });
    }
}