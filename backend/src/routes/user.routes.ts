import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import multer from 'multer';

const router = Router();
const userController = new UserController();

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  }
});

// Rotas protegidas que requerem autenticação
router.use(authMiddleware);

// Rota para obter o perfil do usuário
router.get('/profile', userController.getProfile);

// Rota para atualizar o perfil do usuário
router.put('/profile', userController.updateProfile);

// Rota para atualizar a foto de perfil
router.put('/avatar', upload.single('avatar'), userController.updateAvatar);

export default router; 