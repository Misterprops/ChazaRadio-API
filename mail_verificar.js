import mongoose from "mongoose";
const esquema = new mongoose.Schema({
    verificado: Boolean
});
const user_ver = mongoose.models.user_ver || mongoose.model("user_ver", esquema, "Usuarios")

export const mail_verificar = async (req, res) => {

    if (verificar(req.body.id)) {
        const esquema = new mongoose.Schema({
            id: String,
            codigo: String,
            vencimiento: Date
        });
        const code_ver = mongoose.models.code_ver || mongoose.model("code_ver", esquema, "Verificacion")
        try {
            const codigo = await code_ver.findOne({ id: req.body.id }, { codigo: 1, vencimiento: 1, _id: 0 });
            console.log(codigo);
            if (codigo == null) return res.status(400).json({ error: "Usuario no encontrado" });
            if (codigo.codigo !== req.body.codigo)
                return res.status(400).json({ error: 'Código incorrecto' });

            if (Date.now() > codigo.vencimiento)
                return res.status(400).json({ error: 'El código expiró' });

            actualizar_usuario(req.body.id);
            return res.json({ message: 'Cuenta verificada exitosamente', codigo });
        } catch (err) {
            return res.status(400).json({ error: "error" });
        }
    } else {
        return res.status(400).json({ error: "Usuario no encontrado o verificado" });
    }
}

const verificar = async (id) => {
    try {
        const usuario = await user_ver.findOne({ id: id }, { verificado: 1, _id: 0 });
        console.log(usuario);
        if (usuario == null) return false
        if (usuario.verificado) return false
        return true
    } catch (err) {
        return false
    }
}

const actualizar_usuario = async (id) => {
    await user_ver.findOneAndUpdate({ id: id }, {
        verificado: true
    });

}