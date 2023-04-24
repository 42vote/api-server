import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import * as dotenv from 'dotenv';

@Injectable()
export class AwsS3Service {
  private s3: S3;
  constructor() {
    dotenv.config();
    this.s3 = new S3({
      accessKeyId: 'AKIAQYQTHPN7YIG2BK6S',
      secretAccessKey: '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',
      region: 'ap-northeast-2',
    });
  }

  async uploadOne(filename: string, context: string): Promise<string> {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: filename,
      Body: context,
    };
    const result = await this.s3.upload(params).promise();
    return result.Location;
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
