import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';
import path from 'path';

import { UPLOAD_IMAGE_DIR } from '~/constants/dir';
import { MEDIAS_MESSAGES } from '~/constants/messages';
import { DeleteMediasRequestBody, ServeImageRequestParams } from '~/models/requests/Media.requests';
import mediaService from '~/services/medias.services';

// Upload ảnh
export const uploadImageController = async (req: Request, res: Response) => {
  const result = await mediaService.handleUploadImage(req);
  return res.json(result);
};

// Xóa ảnh ở S3 và xóa thông tin ảnh trong database
export const deleteImageController = async (
  req: Request<ParamsDictionary, any, DeleteMediasRequestBody>,
  res: Response
) => {
  const { media_ids } = req.body;
  const _media_ids = media_ids.map((id) => new ObjectId(id));
  const result = await mediaService.deleteImages(_media_ids);
  return res.json(result);
};

// Lấy ảnh
export const serveImageController = async (req: Request<ServeImageRequestParams>, res: Response) => {
  const { name } = req.params;
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      return res.status((err as any).status).send(MEDIAS_MESSAGES.FILE_NOT_FOUND);
    }
  });
};
