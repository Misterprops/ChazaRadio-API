import jwt from "jsonwebtoken"

export function generateAccessToken(user) {

    return jwt.sign(
        {
            id: user.id,
            email: user.correo,
            rol: user.rol
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "5m"
        }
    )
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