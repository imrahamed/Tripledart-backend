import AWS from 'aws-sdk';
import { ENV } from '../config/environment';

AWS.config.update({
  accessKeyId: ENV.AWS_ACCESS_KEY_ID,
  secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
  region: ENV.AWS_REGION
});

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const sendEmail = async (options: EmailOptions): Promise<void> => {
  const params = {
    Destination: {
      ToAddresses: [options.to]
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: options.html || options.text || ''
        },
        Text: {
          Charset: "UTF-8",
          Data: options.text || options.html || ''
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: options.subject
      }
    },
    Source: ENV.SES_SENDER_EMAIL
  };

  try {
    await ses.sendEmail(params).promise();
  } catch (error) {
    console.error('Error sending email via SES:', error);
    throw error;
  }
};

export default sendEmail;
