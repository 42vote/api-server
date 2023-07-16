import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import * as dotenv from 'dotenv';

dotenv.config();
@Injectable()
export class AwsS3Service {
  private s3: S3;
  constructor() {
    dotenv.config();
    this.s3 = new S3({
      accessKeyId: process.env.AWS_S3_ACCESS,
      secretAccessKey: process.env.AWS_S3_SECRET,
      region: process.env.AWS_S3_REGION,
    });
  }

  async uploadOne(filename: string, context: string): Promise<string> {
    try {
      const mimeType = context.split(';')[0].split(':')[1];
      const imageBuffer = Buffer.from(context.split(',')[1], 'base64');

      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: filename,
        Body: imageBuffer,
        ContentType: mimeType,
      };
      const result = await this.s3.upload(params).promise();
      return result.Location;
    } catch (e) {
      console.log(e.message);
      return null;
    }
  }

  async deleteOne(filename: string) {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: filename,
    };
    return await this.s3.deleteObject(params).promise();
  }

  async deleteDir(dirname: string) {
    const files = await this.listFiles(dirname);
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Delete: { Objects: files.map((x) => ({ Key: x.Key })) },
    };
    return await this.s3.deleteObjects(params).promise();
  }

  async listFiles(dirname: string): Promise<Array<any>> {
    const listParams = {
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: dirname + '/',
    };
    const res = await this.s3.listObjectsV2(listParams).promise();
    return res.Contents.map((x) => x);
  }
}
