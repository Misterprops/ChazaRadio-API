import nodemailer from "nodemailer";
export const mail_transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'radiochaza@gmail.com',
        pass: 'ujvk bnoc ojop tcti'
    }
});