import { codeVer, userVer } from "../database/esquemas.js";

/**
 * Verifica el código enviado al usuario.
 * 
 * @async
 * @function mail_verificar
 * 
 * @param {Request} req - Objeto Request de Express
 * @param {string} req.body.id - ID del usuario
 * @param {string} req.body.codigo - Codigo de verificacion
 * @param {Object} res - Objeto Response de Express
 * 
 * @returns {Response} Respuesta HTTP:
 * - 200: Audio subido correctamente
 * - 400: Datos inconsistentes
 * - 500: Error interno del servidor
 * 
 * @sideEffects
 * - Actualiza DB
 * 
 * @dependencies
 * - Revisar funcion verificar()
 * - Revisar funcion actualizar_usuario()
 * - Revisar esquema codeVer
 * - Revisar constante externa validarMailVerificar
 * 
 * @description
 * - Endpoint que verifica el codigo del usuario para marcarlo como usuario verificado y darle acceso a la red social
 */
export const mail_verificar = async (req, res) => {

    if (await verificar(req.body.id)) {
        try {
            const codigo = await codeVer.findOne({ id: req.body.id }, { codigo: 1, vencimiento: 1, _id: 0 });
            if (codigo == null) return res.status(400).json({ error: "Usuario no encontrado" });
            if (codigo.codigo !== req.body.codigo) return res.status(400).json({ error: 'Código incorrecto' });
            if (Date.now() > codigo.vencimiento) return res.status(400).json({ error: 'El código expiró' });

            await actualizar_usuario(req.body.id);

            return res.status(200).json({ msg: 'Cuenta verificada exitosamente', codigo });
        } catch (err) {
            return res.status(500).json({ error: "Error al verificar la cuenta" });
        }
    } else {
        return res.status(400).json({ error: "Usuario no encontrado o verificado" });
    }
}

/**
 * Marca un usuario como verificado en la base de datos.
 * 
 * @async
 * @function actualizar_usuario
 * @param {string} id - ID del usuario
 * @returns {Promise<void>}
 * 
 * @sideEffects
 * - Actualiza DB
 * 
 * @dependencies
 * - Revisar esquema userVer
 * 
 * @description
 * - Se ejecuta después de validar correctamente el código de verificación enviado por correo.
 */
const actualizar_usuario = async (id) => {
    await userVer.findOneAndUpdate({ id: id }, {
        verificado: true
    });
}

/**
 * Verifica si un usuario existe y aún NO ha sido verificado.
 * 
 * @async
 * @function verificar
 * @param {string} id - ID del usuario
 * @returns {Promise<boolean>}
 * - true: usuario válido para verificación
 * - false: usuario no existe o ya verificado
 * @dependencies
 * - Revisar esquema userVer
 * @description
 * - Verifica si el usuario existe y si este no ha sido verificado
 * @throws
 * - Retorna false en caso de error, indicando que no se pudo obtener informacion del usuario
 */
const verificar = async (id) => {
    try {
        const usuario = await userVer.findOne({ id: id }, { verificado: 1, _id: 0 });
        if (usuario == null) return false
        if (usuario.verificado) return false
        return true
    } catch (err) {
        return false
    }
}