import { mail_transporter } from "./mail_transporter.js";
export const mail_sender = async (email, codigo) => {
    const mailOptions = {
        from: 'RadioChaza <radiochaza@gmail.com>',
        to: email,
        subject: 'Código de verificación RadioChaza',
        html: `<p>Tu código de verificación es:</p><h2>${codigo}</h2><p>Caduca en 10 minutos.</p>`
    };

    await mail_transporter.sendMail(mailOptions);
}