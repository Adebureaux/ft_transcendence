import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import * as multer from "multer";

export const saveAvatarToStorage: MulterOptions = {
    limits: { fileSize: 2048 * 1000, files: 1 },
    storage: multer.diskStorage({
        destination: "./images",
    }),

    fileFilter: function (request, file, callback) {
        if (file.mimetype === "image/png" || file.mimetype === "image/jpeg" || file.mimetype === "image/jpg") {
            request.fileValidationError = null;
            callback(null, true);
        } else {
            request.fileValidationError = "unsupported mimetype and or bad file extension";
            callback(null, false);
        }
    },
};
