import { mail_transporter } from "./mail_transporter.js";
import mongoose from "mongoose";
export const mail_sender = async (email, codigo) => {
    const mailOptions = {
        from: 'RadioChaza <radiochaza@gmail.com>',
        to: email,
        subject: 'Código de verificación RadioChaza',
        html: `<p>Tu código de verificación es:</p><h2>${codigo}</h2><p>Caduca en 10 minutos.</p>`
    };

    await mail_transporter.sendMail(mailOptions);
}

export const mail_request = async (id, correo) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpires = Date.now() + 10 * 60 * 1000

    const esquema = new mongoose.Schema({
        id: String,
        codigo: String,
        vencimiento: String
    });

    const new_verificacion = mongoose.models.new_verificacion || mongoose.model("new_verificacion", esquema, "Verificacion");

    const verificacion = await new_verificacion.create({
        id: id,
        codigo: code,
        vencimiento: codeExpires
    });

    console.log(verificacion)

    mail_sender(correo, code)
}