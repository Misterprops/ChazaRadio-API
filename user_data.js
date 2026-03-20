import mongoose from "mongoose";
import { mail_request } from "./mail_sender.js";
import { generateAccessToken } from "./tokenServices.js";
export async function user_data(req, res) {
    const esquema = new mongoose.Schema({
        nombre: String,
        correo: String
    });
    const user = mongoose.models.user || mongoose.model("user", esquema, "Usuarios")
    try {
        const usuario = await user.findOne({ id: req.user.id }, { nombre: 1, correo: 1, _id: 0 });
        console.log("Usuario " + usuario)
        res.json(usuario);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export async function user_login(req, res) {
    const esquema = new mongoose.Schema({
        id: String,
        contraseña: String,
        verificado: Boolean,
        correo: String,
        rol: String
    });
    const user_log = mongoose.models.user_log || mongoose.model("user_log", esquema, "Usuarios")
    try {
        const usuario = await user_log.findOne({ id: req.body.id }, { id: 1, contraseña: 1, correo: 1, verificado: 1, rol: 1, _id: 0 });
        if (usuario == null) return res.status(400).json({ error: "Usuario no encontrado" });
        if (usuario.verificado == false) return res.status(400).json({ error: "Usuario no verificado" });
        if (req.body.password != usuario.contraseña) return res.status(400).json({ error: "Contraseña incorrecta" });
        const accessToken = generateAccessToken({ id: usuario.id, correo: usuario.correo, rol: usuario.rol })
        res.json(accessToken);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export async function user_register(req, res) {
    console.log(req.body)
    const esquema = new mongoose.Schema({
        id: String,
        nombre: String,
        correo: String,
        contraseña: String,
        rol: { type: String, default: "usuario" },
        verificado: { type: Boolean, default: false },
        creacion: { type: Date, default: Date.now }
    });

    const registro_usuario = mongoose.models.registro_usuario || mongoose.model("registro_usuario", esquema, "Usuarios");

    const nuevoUsuario = await registro_usuario.create({
        id: req.body.id,
        nombre: req.body.user,
        correo: req.body.email,
        contraseña: req.body.password
    });

    mail_request(req.body.id, req.body.email)

    return res.json(nuevoUsuario)
}