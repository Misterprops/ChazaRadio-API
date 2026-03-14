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

export const storageService = {
    async save(fileBuffer, filename) {
        if (storageType === "local") {
            const filePath = path.join(localPath, filename);
            fs.writeFileSync(filePath, fileBuffer);
            return filename;
        }

        if (storageType === "azure") {
            const blockBlobClient = containerClient.getBlockBlobClient(filename);
            await blockBlobClient.uploadData(fileBuffer);
            return filename;
        }
    },

    getUrl(filename) {
        return `${process.env.MEDIA_BASE_URL}/${filename}`;
    }
};