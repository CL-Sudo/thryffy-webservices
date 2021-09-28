import Multer from 'multer';

const storage = Multer.memoryStorage();
const upload = Multer({ storage });

export const multerMiddleware = upload.any();
