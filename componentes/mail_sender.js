import { codeTime, newVerificacion, userMail } from "../database/esquemas.js";
import { mail_transporter } from "../services/mail_transporter.js";

/**
 * Envía un nuevo código de verificación al usuario.
 * 
 * @async
 * @function request_code
 * 
 * @param {string} codigo - Codigo de verificación usuario
 * @param {string} email - Correo electrónico del usuario
 * 
 * @returns {Promise<void>}
 * 
 * @dependencies
 * - Revisar funcion externa mail_transporter()
 * @description
 * - Envía el correo mediante servicio de mailing con el nuevo codigo
 */
export const mail_sender = async (email, codigo) => {
    //Configura el mensaje del correo
    const mailOptions = {
        //De
        from: 'RadioChaza <radiochaza@gmail.com>',
        //Para
        to: email,
        //Asunto
        subject: 'Código de verificación RadioChaza',
        //Mensaje
        html: `<p>Tu código de verificación es:</p><h2>${codigo}</h2><p>Caduca en 10 minutos.</p>`
    };
    //Envio del correo
    await mail_transporter().sendMail(mailOptions);
}

/**
 * Genera un código de verificación al correo del usuario.
 * 
 * @async
 * @function mail_request
 * @param {string} id - ID del usuario
 * @param {string} correo - Correo electrónico del usuario
 * @returns {Promise<void>}
 * @dependencies
 * - Revisar esquema newVerificacion
 * - Revisar funcion mail_sender()
 * @description
 * - Genera un código numérico de 6 dígitos
 * - Define tiempo de expiración (10 minutos)
 * - Define tiempo mínimo de reenvío (2 minutos)
 * - Actualiza o inserta el código en base de datos
 */
export const mail_request = async (id, correo) => {
    //Genarador del codigo
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    //Vencimiento del codigo
    const codeExpires = Date.now() + 10 * 60 * 1000
    //Enfriamiento para generar otro codigo
    const codeCreate = Date.now() + 2 * 60 * 1000

    //Actualiza o crea los datos del codigo
    const verificacion = await newVerificacion.findOneAndUpdate(
        { id: id },
        {
            codigo: code,
            vencimiento: codeExpires,
            creado: codeCreate
        },
        {
            upsert: true,
            returnDocument: 'after'
        });

    //Envia el correo con el codigo
    mail_sender(correo, code)
}

/**
 * Solicita el reenvío de código de verificación.
 * 
 * @async
 * @function request_code
 * @param {Request} req - Objeto Request de Express
 * @param {string} req.body.id - ID del usuario
 * @param {Response} res - Objeto Response de Express
 * 
 * @returns {Response} Respuesta HTTP:
 * - 200: Correo enviado exitosamente
 * - 400: Datos invalidos (validarRequestCode)
 * - 401: Código aún válido o usuario inválido
 * - 500: Error interno del servidor
 * 
 * @sideEffects
 * - Envia correo al usuario
 * 
 * @dependencies
 * - Revisar funcion check_code_time()
 * - Revisar esquema userMail
 * - Revisar funcion mail_request()
 * - Revisar constante externa validarRequestCode
 * 
 * @description
 * - Recibe el id del usuario para enviar un codigo de usuario verificado
 * - Verifica si el codigo ya caduco, si no, no envia el correo
 * - Verifica si el usuario coincide y existe
 * - Envia el correo con el codigo nuevo
 */
export const request_code = async (req, res) => {
    try {
        //Si el codigo aun no ha cumplido su enfriamiento, generar mensaje de codigo valido
        if (! await check_code_time(req.body.id)) return res.status(401).json({ error: "Codigo aun valido" })
        //Obtiene el id y correo del usuario
        const usuario = await userMail.findOne({ id: req.body.id }, { id: 1, correo: 1, _id: 0 });
        //Si no hay usuario, generar mensaje de usuario no encontrado
        if (usuario == null) return res.status(401).json({ error: "Usuario no encontrado" });
        //Si el id del usuario es diferente al ingresado, generar mensaje de ID no coincide
        if (usuario.id != req.body.id) return res.status(401).json({ error: "ID no coincide" })
        //Hace el proceso de enviar el correo
        mail_request(usuario.id, usuario.correo)
        res.status(200).json({ msg: "Correo enviado" })
    } catch (err) {
        res.status(500).json({ error: "Error para enviar el correo" })
    }
}

/**
 * Verifica si el usuario puede solicitar un nuevo código de verificación.
 * 
 * @async
 * @function check_code_time
 * @param {string} id - ID del usuario
 * @returns {Promise<boolean>} 
 * - true: Puede solicitar nuevo código
 * - false: Aún está en tiempo de espera
 * @dependencies
 * - Revisar esquema codeTime
 * @description
 * - Evalúa el tiempo de creación del último código para aplicar un cooldown y evitar spam de solicitudes.
 */
const check_code_time = async (id) => {
    //Busca el tiempo de enfriamiento del codigo del usuario
    const verificado = await codeTime.findOne({ id: id }, { creado: 1, _id: 0 });
    //Si no hay codigo o esta en enfriamiento, retorna false
    if (verificado == null) return false
    if (Date.now() < verificado.creado) return false
    return true
}