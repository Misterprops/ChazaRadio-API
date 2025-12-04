export const mail_verificar = async (req, res, db) => {
    const { email, codigo } = req.body;

    const user = await db;

    if (!user || user.isVerified) return res.status(400).json({ error: 'Usuario inválido' });

    if (user.codigo !== codigo)
        return res.status(400).json({ error: 'Código incorrecto' });

    if (Date.now() > user.codeExpires)
        return res.status(400).json({ error: 'El código expiró' });

    db.codigo ? console.log("Es") : console.log("No Es"); // isVerified = true, borrar el código

    res.json({ message: 'Cuenta verificada exitosamente' });
}