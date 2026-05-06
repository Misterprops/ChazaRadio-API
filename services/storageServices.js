import fs from "fs";
import path from "path";
//import { BlobServiceClient } from "@azure/storage-blob";

const storageType = process.env.STORAGE_TYPE || "local";

let containerClient = null;
let localPath = null;

// 🔹 Configuración LOCAL
if (storageType === "local") {
    localPath = path.resolve(process.env.MEDIA_PATH || "./media");

    if (!fs.existsSync(localPath)) {
        fs.mkdirSync(localPath, { recursive: true });
    }
}

/*// 🔹 Configuración AZURE
if (storageType === "azure") {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );

  containerClient = blobServiceClient.getContainerClient(
    process.env.AZURE_CONTAINER_NAME
  );
}*/

/**
 * Sube un archivo de audio
 *
 * @class
 *
 * @description
 * - Clase encargada de crear un archivo de audio y obtener su url
 */
export const storageService = {
    /**
     * Crea un archivo de audio
     *
     * @async
     * @function save
     *
     * @param {File} fileBuffer - Pista de audio
     * @param {string} filename - Nombre de la pista
     *
     * @returns {void}
     * 
     * @sideEffects
     * - Crea archivos de manera local en carpeta /media o en blob storage
     *
     * @description
     * - Dependiendo del tipo de storage
     *   - Genera el arrchivo de manera local en una carpeta
     *   - Sube el archivo a la nube
     */
    async save(fileBuffer, filename) {
        if (storageType === "local") {
            const filePath = path.join(localPath, filename);
            fs.writeFileSync(filePath, fileBuffer);
        }

        if (storageType === "azure") {
            const blockBlobClient = containerClient.getBlockBlobClient(filename);
            await blockBlobClient.uploadData(fileBuffer);
        }
    },
    /**
     * Obtiene el url de una pista de audio
     *
     * @async
     * @function getUrl
     *
     * @param {Request} filename - Nombre de la pista de audio
     *
     * @returns {string} Url del archivo
     * 
     * @description
     * - Obtiene el url de la pista
     * - Toma en cuenta el entorno donde esta debe estar (local | nube)
     */
    getUrl(filename) {
        return `${process.env.MEDIA_BASE_URL}/${filename}`;
    }
};