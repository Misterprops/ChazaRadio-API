import mongoose from "mongoose";

/**
 * Se conecta a la base de datos de mongo.
 * 
 * @function conectardb
 * 
 * @param {Object} uri - Direccion de la base de datos
 * 
 */
export async function conectardb(uri) {
    try {
        //Conexión a DB
        await mongoose.connect(uri)
    } catch (err) {
        console.log("Error al conectar a la base de datos")
    }
}

