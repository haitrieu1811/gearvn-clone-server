/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import fs from 'fs';
import path from 'path';

import { ENV_CONFIG } from '~/constants/config';

// Create SES service object.
const sesClient = new SESClient({
  region: ENV_CONFIG.AWS_REGION,
  credentials: {
    secretAccessKey: ENV_CONFIG.AWS_SECRET_ACCESS_KEY,
    accessKeyId: ENV_CONFIG.AWS_ACCESS_KEY_ID
  }
});

const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
}: {
  fromAddress: string;
  toAddresses: string | string[];
  ccAddresses?: string | string[];
  body: string;
  subject: string;
  replyToAddresses?: string | string[];
}) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
      ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses]
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromAddress,
    ReplyToAddresses: replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses]
  });
};

const sendMail = async (toAddress: string, subject: string, body: string) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: ENV_CONFIG.SES_FROM_ADDRESS,
    toAddresses: toAddress,
    body,
    subject
  });
  return sesClient.send(sendEmailCommand);
};

const verifyEmailTemplate = fs.readFileSync(path.resolve('src/templates/verify-email.html'), 'utf8');

export const sendVerifyEmail = async (toAddress: string, email_verify_token: string) => {
  return sendMail(
    toAddress,
    'Verify Your Email',
    verifyEmailTemplate
      .replace('{{title}}', 'Verify Your Email')
      .replace(
        '{{content}}',
        '<p>If you are an account registrant at Gearvn Clone, please click on the link below to verify your email.</p><p>If you are not the account creator, please ignore this email and do not click on the link below.</p>'
      )
      .replace('{{link}}', `${ENV_CONFIG.CLIENT_URL}/verify-email?token=${email_verify_token}`)
      .replace('{{link_text}}', 'Verify Email')
  );
};

sendVerifyEmail('haitrieu2527@gmail.com', '123');
