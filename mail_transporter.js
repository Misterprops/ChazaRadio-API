import nodemailer from "nodemailer";
const user = process.env.MAIL_USER;
const pass = process.env.MAIL_PASS;
export const mail_transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: user,
        pass: pass
    }
});