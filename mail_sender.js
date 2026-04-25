import { codeTime, newVerificacion, userMail } from "./database/esquemas.js";
import { mail_transporter } from "./mail_transporter.js";

export const mail_sender = async (email, codigo) => {
    const mailOptions = {
        from: 'RadioChaza <radiochaza@gmail.com>',
        to: email,
        subject: 'Código de verificación RadioChaza',
        html: `<p>Tu código de verificación es:</p><h2>${codigo}</h2><p>Caduca en 10 minutos.</p>`
    };
    await mail_transporter().sendMail(mailOptions);
}

export const mail_request = async (id, correo) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpires = Date.now() + 10 * 60 * 1000
    const codeCreate = Date.now() + 2 * 60 * 1000

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

    mail_sender(correo, code)
}

export const request_code = async (req, res) => {
    try {
        if (! await check_code_time(req.body.id)) return res.status(400).json({ error: "Codigo aun valido" })
        const usuario = await userMail.findOne({ id: req.body.id }, { id: 1, correo: 1, _id: 0 });
        if (usuario == null) return res.status(400).json({ error: "Usuario no encontrado" });
        if (usuario.id != req.body.id) return res.status(400).json({ error: "ID no coincide" })
        mail_request(usuario.id, usuario.correo)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

const check_code_time = async (id) => {
    const verificado = await codeTime.findOne({ id: id }, { creado: 1, _id: 0 });
    if (verificado == null) return false
    if (Date.now() < verificado.creado) return false
    return true
}