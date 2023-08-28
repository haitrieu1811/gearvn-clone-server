import { S3 } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Response } from 'express';
import fs from 'fs';

import { ENV_CONFIG } from '~/constants/config';
import HTTP_STATUS from '~/constants/httpStatus';

const s3 = new S3({
  region: ENV_CONFIG.AWS_REGION,
  credentials: {
    accessKeyId: ENV_CONFIG.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV_CONFIG.AWS_SECRET_ACCESS_KEY
  }
});

export const uploadFileToS3 = ({
  filename,
  filepath,
  contentType
}: {
  filename: string;
  filepath: string;
  contentType: string;
}) => {
  const parallelUploads3 = new Upload({
    client: s3,
    params: {
      Bucket: ENV_CONFIG.AWS_S3_BUCKET_NAME,
      Key: filename,
      Body: fs.readFileSync(filepath),
      ContentType: contentType
    },
    tags: [
      /*...*/
    ], // optional tags
    queueSize: 4, // optional concurrency configuration
    partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
    leavePartsOnError: false // optional manually handle dropped parts
  });
  return parallelUploads3.done();
};

export const sendFileFromS3 = async (res: Response, filepath: string) => {
  try {
    const data = await s3.getObject({
      Bucket: ENV_CONFIG.AWS_S3_BUCKET_NAME,
      Key: filepath
    });
    (data.Body as any).pipe(res);
  } catch (error) {
    res.status(HTTP_STATUS.NOT_FOUND).send('Not found');
  }
};

// parallelUploads3.on("httpUploadProgress", (progress) => {
//   console.log(progress);
// });

// parallelUploads3.done().then((data) => {
//   console.log(data);
// });
