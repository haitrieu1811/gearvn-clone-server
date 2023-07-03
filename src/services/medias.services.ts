import { Request } from 'express';
import path from 'path';
import sharp from 'sharp';
import fs from 'fs';

import { handleUploadImage } from '~/utils/file';
import { Media } from '~/models/Others';
import { getNameFromFullname } from '~/utils/file';
import { UPLOAD_IMAGE_DIR } from '~/constants/dir';
import { MediaType } from '~/constants/enum';
import { isProduction } from '~/constants/config';

class MediaService {
  async handleUploadImage(req: Request) {
    const images = await handleUploadImage(req);
    const result: Media[] = await Promise.all(
      images.map(async (image) => {
        const newName = `${image.newFilename}.jpg`;
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newName);
        await sharp(image.filepath).jpeg().toFile(newPath);
        fs.unlinkSync(image.filepath);
        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newName}`
            : `http://localhost:${process.env.PORT}/static/image/${newName}`,
          type: MediaType.Image
        };
      })
    );
    return result;
  }
}

const mediaService = new MediaService();
export default mediaService;
