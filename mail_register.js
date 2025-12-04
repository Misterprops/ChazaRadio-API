import { mail_sender } from "./mail_sender.js";

export const mail_register = async (db, res) => {
    await mail_sender(db.email, db.codigo);
    res.status(200).json({ message: 'Código enviado al correo.' });
}