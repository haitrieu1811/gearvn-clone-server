import { Router } from 'express';
import { deleteImageController, uploadImageController } from '~/controllers/medias.controllers';
import { deleteMediasValidator } from '~/middlewares/medias.middlewares';
import { accessTokenValidator, adminRoleValidator } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handler';

const mediasRouter = Router();

// Upload ảnh
mediasRouter.post('/upload-image', wrapRequestHandler(uploadImageController));

// Xóa ảnh ở S3 và xóa thông tin ảnh trong database
mediasRouter.delete(
  '/',
  accessTokenValidator,
  adminRoleValidator,
  deleteMediasValidator,
  wrapRequestHandler(deleteImageController)
);

export default mediasRouter;
