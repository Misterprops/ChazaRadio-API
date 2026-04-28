import mongoose from "mongoose";

//Esquemas de usuario
const esquemaUser = new mongoose.Schema({
    id: String,
    nombre: String,
    contraseña: String,
    verificado: Boolean,
    correo: String,
    rol: String
});
export const user = mongoose.models.user || mongoose.model("user", esquemaUser, "Usuarios");

const esquemaReg = new mongoose.Schema({
    id: String,
    nombre: String,
    correo: String,
    contraseña: String,
    rol: { type: String, default: "usuario" },
    verificado: { type: Boolean, default: false },
    creacion: { type: Date, default: Date.now }
});
export const userReg = mongoose.models.userReg || mongoose.model("userReg", esquemaReg, "Usuarios");

const esquemaUserData = new mongoose.Schema({
    nombre: String,
    correo: String
});
export const userData = mongoose.models.userData || mongoose.model("userData", esquemaUserData, "Usuarios");

//Esquemas mail_verificar
const esquemaCodeVer = new mongoose.Schema({
    id: String,
    codigo: String,
    vencimiento: Date
});
export const codeVer = mongoose.models.codeVer || mongoose.model("codeVer", esquemaCodeVer, "Verificacion")

const esquemaUserVer = new mongoose.Schema({
    verificado: Boolean
});
export const userVer = mongoose.models.userVer || mongoose.model("userVer", esquemaUserVer, "Usuarios")


//Esquemas mail_sender
const esquemaNewVer = new mongoose.Schema({
    id: String,
    codigo: String,
    vencimiento: String,
    creado: String
});

export const newVerificacion = mongoose.models.newVerificacion || mongoose.model("newVerificacion", esquemaNewVer, "Verificacion");

const esquemaUserMail = new mongoose.Schema({
    id: String,
    correo: String
})
export const userMail = mongoose.models.userMail || mongoose.model("userMail", esquemaUserMail, "Usuarios")

const esquemaCodeTime = new mongoose.Schema({
    id: String,
    creado: String
});
export const codeTime = mongoose.models.codeTime || mongoose.model("codeTime", esquemaCodeTime, "Verificacion");

//Esquema poadcast
const esquemaPoadcast = new mongoose.Schema({
    id: String,
    nombre: String,
    autores: String,
    capitulo: [{
        creacion: { type: Date, default: Date.now },
        url: String
    }]
});

export const poadcast = mongoose.models.poadcast || mongoose.model("poadcast", esquemaPoadcast, "Poadcasts");

//Esquemas posts
//Publicar post
const esquemaUploadPost = new mongoose.Schema({
    id: String,
    mensaje: String,
    link: String,
    nombre: String,
    tipo: String,
    creacion: { type: Date, default: Date.now }
});

export const uploadPost = mongoose.models.uploadPost || mongoose.model("uploadPost", esquemaUploadPost, "Posts");

//Obtener posts
const esquemaGetPosts = new mongoose.Schema({
    id: String,
    mensaje: String,
    link: String,
    nombre: String,
    tipo: String,
    enabled: Boolean
});

export const getPosts = mongoose.models.getPosts || mongoose.model("getPosts", esquemaGetPosts, "Posts");

//Obtener audios
const esquemaGetAudios = new mongoose.Schema({
    url: String,
    titulo: String,
    likes: Number,
    autor: String,
    escuchada: Boolean
});

export const getAudios = mongoose.models.getAudios || mongoose.model("getAudios", esquemaGetAudios, "Audios");