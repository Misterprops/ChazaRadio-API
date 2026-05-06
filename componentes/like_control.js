import { likeContador } from "./audio_data.js";
import { cacheServices } from "../services/cacheServices.js";
import { likeCreate, listaLikes } from "../database/esquemas.js";

/**
 * Cache local de likes
 * Se refrezca automaticamente despues de cada 3 minutos
 */
let cache = {
    data: null,
    ttl: 180000,
    lastTtl: Date.now()
}

/**
 * Alterna like/unlike de un audio para el usuario autenticado.
 * 
 * @async
 * @function likeControl
 * 
 * @param {Request} req - Objeto Request de Express
 * @param {string} req.body.url - Url de la pista
 * @param {Object} req.user - Usuario autenticado (JWT decodificado)
 * @param {string} req.user.id - ID del usuario
 * @param {Response} res - Objeto Response de Express
 * 
 * @returns {string[]} Listado de likes del usuario
 * @returns {Response} Respuesta HTTP:
 * - 200: Listado de likes del usuario
 * - 400: Datos invalidos (validarLikeControl)
 * - 500: Error interno del servidor
 * 
 * @sideEffects
 * - Actualiza cache de likes
 * - Actualiza contador de likes de la DB
 * - Actualiza cache de audios
 * - Actualiza la lista de likes de la DB
 * 
 * @dependencies
 * - Revisar variable cache de likes
 * - Revisar esquema likeCreate
 * - Revisar funcion externa autenticateToken()
 * - Revisar constante externa validarLikeControl
 * - Revisar funcion externa likeContador()
 * - Revisar la funcion likeList()
 *
 * @description
 * - Busca en los registros de likes si el usuario le dio like a una pista
 * - Si es asi, lo elimina y reduce el contador de la pista
 * - Si no, crea el registro y aumenta el contador de la pista
 */
export async function likeControl(req, res) {
    try {
        //Busca si el usuario ya le dio el like a la pista
        const existe = await likeCreate.findOne({
            url: req.body.url,
            id: req.user.id
        });

        if (!existe) {
            //Si no le ha dado like, crea el registro del like
            await likeCreate.create({
                url: req.body.url,
                id: req.user.id
            });

            //Aumenta el contador de likes de la pista
            await likeContador(req.body.url, 1)

            //Agrega al cache el registro del like
            if (cache.data) {
                cache.data.push({
                    url: req.body.url,
                    id: req.user.id
                });
            }
        } else {
            //Si ya tenia like, se lo retira
            const result = await likeCreate.deleteOne({
                url: req.body.url,
                id: req.user.id
            });

            if (result.deletedCount > 0) {
                //Si retiró el like, reduce el contador de la pista en uno
                await likeContador(req.body.url, -1)
                //Elimina el registro del cache
                if (cache.data) {
                    cache.data = cache.data.filter(
                        prev => !(prev.url === req.body.url && prev.id === req.user.id)
                    );
                }
            }


        }
        //Devuelve la nueva lista de likes del usuario
        return res.json(await likeList(req.user.id))
    } catch (error) {
        return res.status(500).json({ error: "Error al modificar el like" })
    }
}

/**
 * Obtiene la lista de URLs que el usuario ha marcado con like.
 * 
 * @async
 * @function get_likeList
 * 
 * @param {Request} req - Objeto Request de Express
 * @param {Object} req.user - Usuario autenticado (JWT decodificado)
 * @param {string} req.user.id - ID del usuario
 * @param {Response} res - Objeto Response de Express
 * 
 * @returns {Promise<string[]>}
 * @returns {Response} Respuesta HTTP:
 * - 200: Listado de likes del usuario
 * - 500: Error interno del servidor
 * 
 * @sideEffects
 * - Actualiza cache de likes
 * 
 * @dependencies
 * - Revisar variable cache de likes
 * - Revisar funcion externa autenticateToken()
 * - Revisar funcion likeList()
 *
 * @description
 * - Llama la funcion likeList() para obtener el listado de likes del usuario
 */
export async function get_likeList(req, res) {
    try {
        //Obtiene y devuelve el listado de likes del usuario
        return res.json(await likeList(req.user.id))
    } catch (error) {
        return res.status(500).json({ error: "Error al obtener el listado de likes" })
    }
}

/**
 * Obtiene la lista de URLs que un usuario ha marcado con like.
 *
 * @async 
 * @function likeList
 * @param {string} id - ID del usuario
 * @returns {Promise<string[]>} - Listado de pistas con like del usuario
 * 
 * @sideEffects
 * - Actualiza cache de likes
 * 
 * @dependencies
 * - Revisar variable cache de likes
 * - Revisar esquema listaLikes
 *
 * @description
 * - Busca en los registros de likes los registros de likes
 * - Devuelve la lista de pistas con like del usuario
 */
const likeList = async (id) => {
    if (!cacheServices(cache)) {
        //Si el cache no es valido, lo refrezca con los registro de likes de la DB
        cache.data = await listaLikes.find();
        //Actualiza el tiempo de vida del cache
        cache.lastTtl = Date.now()
    }
    //Filtra y devuelve los likes que registro el usuario
    const res = cache.data
        .filter(prev => prev.id === id)
        .map(prev => prev.url);
    return res
}