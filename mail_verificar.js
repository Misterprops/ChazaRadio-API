import { codeVer, userVer } from "./database/esquemas.js";

export const mail_verificar = async (req, res) => {

    if (await verificar(req.body.id)) {
        try {
            const codigo = await codeVer.findOne({ id: req.body.id }, { codigo: 1, vencimiento: 1, _id: 0 });
            if (codigo == null) return res.status(400).json({ error: "Usuario no encontrado" });
            if (codigo.codigo !== req.body.codigo) return res.status(400).json({ error: 'Código incorrecto' });
            if (Date.now() > codigo.vencimiento) return res.status(400).json({ error: 'El código expiró' });

            await actualizar_usuario(req.body.id);

            return res.json({ message: 'Cuenta verificada exitosamente', codigo });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    } else {
        return res.status(400).json({ error: "Usuario no encontrado o verificado" });
    }
}

const actualizar_usuario = async (id) => {
    await userVer.findOneAndUpdate({ id: id }, {
        verificado: true
    });
}

const verificar = async (id) => {
    try {
        const usuario = await userVer.findOne({ id: id }, { verificado: 1, _id: 0 });
        if (usuario == null) return false
        if (usuario.verificado) return false
        return true
    } catch (err) {
        return false
    }
}