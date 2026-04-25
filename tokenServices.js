import jwt from "jsonwebtoken"

export function generateAccessToken(user) {

    return jwt.sign(
        {
            id: user.id,
            correo: user.correo,
            nombre: user.nombre,
            rol: user.rol
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "20m"
        }
    )
}

export function reloadAccessToken(req, res) {
    const user = req.user;

    const token = jwt.sign(
        {
            id: user.id,
            correo: user.correo,
            nombre: user.nombre,
            rol: user.rol
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "20m"
        }
    )
    res.json(token);
}

export async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader) {
            return res.sendStatus(401)
        }

        const token = authHeader.split(" ")[1]

        if (!token) {
            return res.sendStatus(401)
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        req.user = decoded

        next()

    } catch (error) {
        return res.sendStatus(403)
    }
}