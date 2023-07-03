import { Request, Response } from 'express';
import path from 'path';
import { UPLOAD_IMAGE_DIR } from '~/constants/dir';
import { MEDIAS_MESSAGES } from '~/constants/messages';
import { ServeImageRequestParams } from '~/models/requests/Media.requests';
import mediaService from '~/services/medias.services';

export const serveImageController = async (req: Request<ServeImageRequestParams>, res: Response) => {
  const { name } = req.params;
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      return res.status((err as any).status).send(MEDIAS_MESSAGES.FILE_NOT_FOUND);
    }
  });
};

export const uploadImageController = async (req: Request, res: Response) => {
  const result = await mediaService.handleUploadImage(req);
  return res.json(result);
};
