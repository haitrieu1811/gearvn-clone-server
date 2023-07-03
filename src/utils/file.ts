import { Request } from 'express';
import fs from 'fs';
import { MEDIAS_MESSAGES } from '~/constants/messages';
import { File } from 'formidable';

import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir';

export const initFolders = () => {
  [UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR].forEach((path) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, {
        recursive: true
      });
    }
  });
};

export const getExtensionFromFullname = (fullname: string) => {
  const nameArr = fullname.split('.');
  return nameArr[nameArr.length - 1];
};

export const getNameFromFullname = (fullname: string) => {
  const nameArr = fullname.split('.');
  nameArr.pop();
  return nameArr.join('');
};

export const handleUploadImage = async (req: Request) => {
  const formiable = (await import('formidable')).default;
  const form = formiable({
    uploadDir: UPLOAD_IMAGE_DIR,
    maxFileSize: 300 * 1024, // 300KB
    maxTotalFileSize: Infinity,
    filter: ({ name, mimetype }) => {
      const valid = name === 'image' && Boolean(mimetype?.includes('image'));
      if (!valid) {
        form.emit('errors' as any, new Error(MEDIAS_MESSAGES.FILE_TYPE_INVALID) as any);
      }
      return valid;
    }
  });
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, _, files) => {
      if (err) {
        return reject(err);
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(new Error(MEDIAS_MESSAGES.IMAGE_FIELD_IS_REQUIRED));
      }
      return resolve(files.image as File[]);
    });
  });
};
