import mongoose from "mongoose";

export async function conectardb(uri) {
    try {
        await mongoose.connect(uri)
        console.log("conectando")
    } catch (err) {
        console.log(err)
    }
}

