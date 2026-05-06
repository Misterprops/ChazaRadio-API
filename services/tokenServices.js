import jwt from "jsonwebtoken"

/**
 * Genera el Json Web Token del usuario autenticado.
 * 
 * @async
 * @function generateAccessToken
 * 
 * @param {Object} user - Usuario autenticado
 * @param {string} user.id - Codigo universitario del usuario
 * @param {string} user.password - Contraseña del usuario
 * @param {string} user.email - Correo universitario del usuario
 * @param {string} user.user - Nombre del usuario
 * 
 * @returns {string} Token JWT con los datos del usuario y tiempo de 15 minutos de sesión
 * 
 * @dependencies
 * - Usa un secret configurado en las variables de entorno
 *
 * @description
 * - Firma un JWT con los datos del usuario y tiempo de sesión de 15 minutos
 */
export function generateAccessToken(user) {
    //Firma JWT
    return jwt.sign(
        //Datos del usuario
        {
            id: user.id,
            correo: user.correo,
            nombre: user.nombre,
            rol: user.rol
        },
        //Secreto
        process.env.ACCESS_TOKEN_SECRET,
        //Tiempo de sesión
        {
            expiresIn: "15m"
        }
    )
}

/**
 * Renueva el Json Web Token del usuario autenticado.
 * 
 * @async
 * @function reloadAccessToken
 * 
 * @param {Request} req - Objeto Request de Express
 * @param {Object} req.user - Usuario autenticado
 * @param {string} req.user.id - Codigo universitario del usuario
 * @param {string} req.user.password - Contraseña del usuario
 * @param {string} req.user.email - Correo universitario del usuario
 * @param {string} req.user.user - Nombre del usuario
 * @param {Object} res - Objeto Response de Express
 * 
 * @returns {string} Token JWT con los datos del usuario y tiempo de 15 minutos de sesión
 * @returns {Response} Respuesta HTTP:
 * - 200: JWT Con los datos del usuario
 * - 500: Error interno del servidor
 * 
 * @dependencies
 * - Usa un secret configurado en las variables de entorno
 *
 * @description
 * - Firma un JWT con los datos del usuario y tiempo de sesión de 15 minutos
 */
export function reloadAccessToken(req, res) {
    try {
        //Obtiene los datos del usuario
        const user = req.user;
        //Genera un nuevo JWT
        const token = jwt.sign(
            //Datos del usuario
            {
                id: user.id,
                correo: user.correo,
                nombre: user.nombre,
                rol: user.rol
            },
            //Secreto
            process.env.ACCESS_TOKEN_SECRET,
            //Tiempo de sesión
            {
                expiresIn: "15m"
            }
        )
        res.json(token);
    } catch (error) {
        res.status(500).json({ error: "Error al renovar el token de usuario" })
    }
}

/**
 * Valida la vigencia del token del usuario.
 *
 * @async
 * @function authenticateToken
 *
 * @param {Request} req - Objeto Request de Express
 * @param {Object} req.headers.authorization - Token de autenticacion con datos del usuario
 * @param {Object} req.user - Datos del usuario autenticado (JWT decodificado)
 *
 * @param {Object} res - Objeto Response de Express
 *
 * @returns {Response} Respuesta HTTP:
 * - 200: (next() - Usuario autenticado)
 * - 401: Usuario no autenticado o expiró
 * - 500: Error interno del servidor
 *
 * @description
 * - Valida la vigencia del token del usuario
 * - Habilita la informacion del usuario para su uso en REST points
 */
export async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader) {
            return res.status(401).json({ error: "Usuario no autenticado" })
        }

        const token = authHeader.split(" ")[1]

        if (!token) {
            return res.status(401).json({ error: "Usuario no autenticado" })
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        req.user = decoded

        next()

    } catch (error) {
        return res.status(500).json({ error: "Usuario no encontrado" })
    }
}