import { poadcast, user } from "../database/esquemas.js";

/**
 * Crea o agrega un episodio a un podcast existente.
 * 
 * @async
 * @function upload_poadcast
 * 
 * @param {Request} req - Objeto Request de Express
 * @param {Object} req.body.url - Url del capitulo
 * @param {string} req.body.serie - Nombre de la serie
 * @param {string} req.body.autores - Nombre del autor
 * @param {Object} res - Objeto Response de Express
 * 
 * @returns {Response} Respuesta HTTP:
 * - 200: Capitulo publicado
 * - 400: Datos invalidos (validarUploadPoadcast)
 * - 403: Usuario no coincide con el creador
 * - 500: Error interno del servidor
 * 
 * @sideEffects
 * - Actualiza DB
 * 
 * @dependencies
 * - Revisar funcion poadcast_creator()
 * - Revisar esquema poadcast
 * - Revisar funcion externa autenticateToken()
 * - Revisar constante externa validarUploadPoadcast
 *
 * @description
 * - Valida formato del url
 * - Valida que el usuario sea el creador
 * - Crea el poadcast si no existe
 * - Ingresa el capitulo al poadcast
 * 
 * @security
 * - Solo el creador puede modificar
 */
export const upload_poadcast = async (req, res) => {
    try {
        //Valida que el url sea valido de youtube
        if ((req.body.url && req.body.url !== "") && (req.body.url.includes("youtube") || req.body.url.includes("youtu.be"))) {
            //Valida que el usuario sea el creador
            if (await poadcast_creator(req.user.id, req.body.serie)) {
                //Actualiza el poadcast, ingresando el capitulo
                await poadcast.updateOne(
                    { nombre: req.body.serie },
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
                    { upsert: true } // Si no existe lo crea
                );
                res.status(200).json({ msg: "Capitulo publicado" });
            } else {
                res.status(403).json({ error: "Usuario no coincide con id de creador" })
            }
        } else {
            res.status(400).json({ error: "El url no es correcto" })
        }
    } catch (error) {
        res.status(500).json({ error: "Error para subir el poadcast" });
    }

};

/**
 * Obtiene todos los podcasts ordenados por nombre.
 * 
 * @async
 * @function get_poadcasts
 * 
 * @returns {Promise<Array>} Lista de poadcasts organizado
 * @returns {Response} Respuesta HTTP:
 * - 500: Error interno del servidor
 * 
 * @dependencies
 * - Revisar esquema poadcast
 */
export async function get_poadcasts(req, res) {
    try {
        const poadcasts = await poadcast
            .find()
            .sort({ nombre: 1 });

        return res.json(poadcasts)
    }catch(error){
        res.status(500).json({ error: "Error para obtener los poadcasts" });
    }
}

/**
 * Verifica si un usuario tiene permisos para crear o modificar un podcast.
 * 
 * Reglas:
 * - Si el podcast no existe → se permite crear
 * - Si existe → solo el creador original puede modificarlo
 * 
 * @async
 * @function poadcast_creator
 * @param {string} id - ID del usuario
 * @param {string} nombre - Nombre de la serie
 * @returns {Promise<boolean>}
 * - true: permitido
 * - false: no autorizado
 * 
 * @dependencies
 * - Revisar esquema poadcast
 *
 * @description
 * - Busca la serie y retorna el id del creador
 * - Valida que el id del usuario sea la del creador
 */
const poadcast_creator = async (id, nombre) => {
    //Obtiene el id de creador
    const autor = await poadcast.findOne(
        { nombre: nombre },
        { id: 1, nombre: 1, _id: 0 }
    )
    //Valida si hay creador y si su id es la del usuario
    if (!autor) return true
    if (id !== autor.id) return false
    //Valida si el nombre corresponde al de la serie
    if (nombre !== autor.nombre) return false
    return true;
}