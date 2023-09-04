import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3';
import { Request } from 'express';
import fsPromise from 'fs/promises';
import mime from 'mime';
import { ObjectId } from 'mongodb';
import path from 'path';
import sharp from 'sharp';

import { UPLOAD_IMAGE_DIR } from '~/constants/dir';
import { MediaType } from '~/constants/enum';
import { MEDIAS_MESSAGES } from '~/constants/messages';
import { Media } from '~/models/Others';
import { getNameFromFullname, handleUploadImage } from '~/utils/file';
import { deleteFileFromS3, uploadFileToS3 } from '~/utils/s3';
import databaseService from './database.services';

class MediaService {
  // Xử lý upload ảnh
  async handleUploadImage(req: Request) {
    const images = await handleUploadImage(req);
    const result: Media[] = await Promise.all(
      images.map(async (image) => {
        const newName = getNameFromFullname(image.newFilename);
        const newFullName = `${newName}.jpg`;
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullName);
        await sharp(image.filepath).jpeg().toFile(newPath);
        const s3Result = await uploadFileToS3({
          filename: `images/${newFullName}`,
          filepath: newPath,
          contentType: mime.getType(newPath) as string
        });
        try {
          await Promise.all([fsPromise.unlink(image.filepath), fsPromise.unlink(newPath)]);
        } catch (error) {
          console.log(error);
        }
        return {
          name: newFullName,
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Image
        };
        // return {
        //   name: newFullName,
        //   url: isProduction
        //     ? `${ENV_CONFIG.HOST}/static/image/${newFullName}`
        //     : `http://localhost:${ENV_CONFIG.PORT}/static/image/${newFullName}`,
        //   type: MediaType.Image
        // };
      })
    );
    return {
      message: MEDIAS_MESSAGES.UPLOAD_IMAGE_SUCCEED,
      data: {
        medias: result
      }
    };
  }

  // Xóa ảnh trên s3 và xóa thông tin ảnh trong database
  async deleteImages(imageIds: ObjectId[]) {
    if (imageIds.length <= 0) return;
    const foundImages = await databaseService.medias
      .find({
        _id: {
          $in: imageIds
        }
      })
      .toArray();
    await databaseService.medias.deleteMany({
      _id: {
        $in: imageIds
      }
    });
    const filepaths = foundImages.map((image) => `images/${image.name}`);
    await Promise.all([filepaths.map((filepath) => deleteFileFromS3(filepath))]);
    return {
      message: MEDIAS_MESSAGES.DELETE_IMAGES_SUCCEED
    };
  }
}

const mediaService = new MediaService();
export default mediaService;
