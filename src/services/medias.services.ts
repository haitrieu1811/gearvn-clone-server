import { Request } from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

import { ENV_CONFIG, isProduction } from '~/constants/config';
import { UPLOAD_IMAGE_DIR } from '~/constants/dir';
import { MediaType } from '~/constants/enum';
import { MEDIAS_MESSAGES } from '~/constants/messages';
import { Media } from '~/models/Others';
import { handleUploadImage } from '~/utils/file';

class MediaService {
  async handleUploadImage(req: Request) {
    const images = await handleUploadImage(req);
    const result: Media[] = await Promise.all(
      images.map(async (image) => {
        const newName = `${image.newFilename}.jpg`;
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newName);
        await sharp(image.filepath).jpeg().toFile(newPath);
        fs.unlink(image.filepath, (err) => {
          if (err) {
            console.error('Lỗi xóa tệp', err);
          } else {
            console.log('Đã xóa tệp', image.filepath);
          }
        });
        return {
          name: newName,
          url: isProduction
            ? `${ENV_CONFIG.HOST}/static/image/${newName}`
            : `http://localhost:${ENV_CONFIG.PORT}/static/image/${newName}`,
          type: MediaType.Image
        };
      })
    );
    return {
      message: MEDIAS_MESSAGES.UPLOAD_IMAGE_SUCCEED,
      data: {
        medias: result
      }
    };
  }
}

const mediaService = new MediaService();
export default mediaService;
