import { mail_request } from "./mail_sender.js";
import { generateAccessToken } from "./tokenServices.js";
import { user, userData, userReg } from "./database/esquemas.js";
import bcrypt from "bcryptjs";

export async function user_data(req, res) {
    try {
        const usuario = await userData.findOne({ id: req.user.id }, { nombre: 1, correo: 1, _id: 0 });
        res.json(usuario);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export async function user_login(req, res) {
    try {
        const usuario = await user.findOne({ id: req.body.id }, { id: 1, nombre: 1, contraseña: 1, correo: 1, verificado: 1, rol: 1, _id: 0 });
        if (usuario == null) return res.status(400).json({ error: "Usuario no encontrado" });
        if (usuario.verificado == false) return res.status(401).json({ error: "Usuario no verificado" });
        if (!await bcrypt.compare(req.body.password, usuario.contraseña)) return res.status(400).json({ error: "Contraseña incorrecta" });
        const accessToken = generateAccessToken({ id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol })
        res.json(accessToken);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

export async function user_register(req, res) {
    try {
        const usuario = await user.findOne({ id: req.body.id }, { id: 1, _id: 0 });
        if (usuario != null) return res.status(400).json({ error: "Id ya registrado" });
        const mail = await user.findOne({ correo: req.body.email }, { correo: 1, _id: 0 });
        if (mail != null) return res.status(400).json({ error: "Correo ya registrado" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const nuevoUsuario = await userReg.create({
            id: req.body.id,
            nombre: req.body.user,
            correo: req.body.email,
            contraseña: await hashedPassword
        });

        mail_request(req.body.id, req.body.email);

        return res.json(nuevoUsuario);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}