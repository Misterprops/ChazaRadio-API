import nodemailer from "nodemailer";

/**
 * Crea y configura un transporter de Nodemailer.
 * 
 * @function mail_transporter
 * @returns {Object} nodemailer transporter
 * 
 * @description
 * - Funcion que crea el transporter para envio de correos
 * - Utiliza credenciales definidas en variables de entorno:
 *   - MAIL_USER
 *   - MAIL_PASS
 * @warning
 * - Usar App Passwords (Gmail)
 * - No usar credenciales reales en código
 */
export const mail_transporter = () => {
    //Crea el transporter
    return nodemailer.createTransport({
        //Usa GMAIL
        service: 'gmail',
        //Credenciales
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    })
};