import { mail_request } from "./mail_sender.js";
import { generateAccessToken } from "../services/tokenServices.js";
import { user, userReg } from "../database/esquemas.js";
import bcrypt from "bcryptjs";

/**
 * Registra un nuevo usuario.
 * 
 * @async
 * @function user_register
 * 
 * @param {Request} req - Objeto Request de Express
 * @param {string} req.body.id - Codigo universitario del usuario
 * @param {string} req.body.password - Contraseña del usuario
 * @param {string} req.body.email - Correo universitario del usuario
 * @param {string} req.body.user - Nombre del usuario
 * @param {Object} res - Objeto Response de Express
 * 
 * @returns {Response} Respuesta HTTP:
 * - 200: Audio subido correctamente
 * - 400: Datos invalidos (validarRegistro)
 * - 403: Usuario o correo ya registrados
 * - 500: Error interno del servidor
 * 
 * @sideEffects
 * - Actualiza DB
 * 
 * @dependencies
 * - Revisar esquema user
 * - Revisar esquema userReg
 * - Revisar constante externa validarRegistro
 *
 * @description
 * - Valida usuarios existentes
 * - Hashea contraseña
 * - Envía código de verificación
 */
export async function user_register(req, res) {
    try {
        //Busca si existe un usuario con el mismo codigo universitario
        const usuario = await user.findOne({ id: req.body.id }, { id: 1, _id: 0 });
        if (usuario) return res.status(403).json({ error: "Codigo universitario ya registrado" });
        //Busca si existe un usuario con el mismo correo
        const mail = await user.findOne({ correo: req.body.email }, { correo: 1, _id: 0 });
        if (mail) return res.status(403).json({ error: "Correo ya registrado" });
        //Codifica la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        //Registra al nuevo usuario
        const nuevoUsuario = await userReg.create({
            id: req.body.id,
            nombre: req.body.user,
            correo: req.body.email,
            contraseña: await hashedPassword
        });
        //Envia el correo de verificacion al usuario
        mail_request(req.body.id, req.body.email);

        return res.status(200).json({ msg: "Usuario registrado" });
    } catch (error) {
        res.status(500).json({ error: "Error al registrar el usuario" });
    }
}

/**
 * Autentica un usuario y genera JWT.
 * 
 * @async
 * @function user_login
 * 
 * @param {Request} req - Objeto Request de Express
 * @param {string} req.body.id - Codigo universitario del usuario
 * @param {string} req.body.password - Contraseña del usuario
 * @param {Object} res - Objeto Response de Express
 * 
 * @returns {Promise<string>} Token JWT con los datos del usuario
 * @returns {Response} Respuesta HTTP:
 * - 200: JWT Con los datos del usuario
 * - 400: Datos invalidos (validarUserLogin)
 * - 401: Usuario no verificado
 * - 500: Error interno del servidor
 * 
 * @dependencies
 * - Revisar esquema user
 * - Revisar funcon externa generateAccessToken()
 * - Revisar constante externa validarUserLogin
 *
 * @description
 * - Valida usuario existe
 * - Valida si está verificado
 * - Valida contraseña correcta (bcrypt)
 */
export async function user_login(req, res) {
    try {
        //Busca el usuario por su id
        const usuario = await user.findOne({ id: req.body.id }, { id: 1, nombre: 1, contraseña: 1, correo: 1, verificado: 1, rol: 1, _id: 0 });
        //Valida que el usuario exista
        if (!usuario) return res.status(400).json({ error: "Usuario no encontrado" });
        //Valida que este verificado
        if (usuario.verificado == false) return res.status(401).json({ error: "Usuario no verificado" });
        //Valida que su contraseña corresponda
        if (!await bcrypt.compare(req.body.password, usuario.contraseña)) return res.status(400).json({ error: "Contraseña incorrecta" });
        //Genera su token de acceso
        const accessToken = generateAccessToken({ id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol })
        console.log("Login"+accessToken)
        console.log(typeof(accessToken))
        //Devuelve el token de acceso
        res.json(accessToken);
    } catch (error) {
        res.status(500).json({ error: "Error al iniciar sesión" })
    }
}