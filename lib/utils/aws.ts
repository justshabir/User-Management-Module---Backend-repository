import aws from 'aws-sdk';

aws.config.update({
  secretAccessKey: process.env.AMAZON_S3_USER_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AMAZON_S3_USER_ACCESS_KEY_ID,
  region: process.env.AMAZON_S3_BUCKET_REGION,
});

export const S3Aws = aws.S3;
