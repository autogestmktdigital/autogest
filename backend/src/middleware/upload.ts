import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config';
import { AppError } from '../utils/AppError';

// Configurar Cloudinary se as credenciais existirem
const hasCloudinaryConfig = env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET;

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

// Configuração do storage local (fallback)
const uploadDir = path.resolve(env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const localStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `vehicle-${uniqueSuffix}${ext}`);
  },
});

const memoryStorage = multer.memoryStorage();

const imageFileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.', 400));
  }
};

const documentFileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Tipo de arquivo não permitido. Use PDF, JPEG ou PNG.', 400));
  }
};

const allFilesFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou PDF.', 400));
  }
};

// Usar memoryStorage se Cloudinary estiver configurado, senão diskStorage
const storage = hasCloudinaryConfig ? memoryStorage : localStorage;

export const upload = multer({
  storage,
  fileFilter: allFilesFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
});

export const uploadDocuments = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB para documentos
  },
});

// Função para fazer upload para Cloudinary
export async function uploadToCloudinary(
  file: Express.Multer.File,
  folder: string = 'vehicles'
): Promise<string> {
  if (!hasCloudinaryConfig) {
    throw new AppError('Cloudinary não configurado', 500);
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          reject(new AppError(`Erro no upload Cloudinary: ${error.message}`, 500));
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new AppError('Erro desconhecido no upload Cloudinary', 500));
        }
      }
    );

    uploadStream.end(file.buffer);
  });
}

export { cloudinary, hasCloudinaryConfig };
