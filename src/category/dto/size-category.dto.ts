import { Transform } from 'class-transformer';
import { IsBooleanString, IsInt, Min } from 'class-validator';
import * as dotenv from 'dotenv';
dotenv.config();
export default class SizeCategoryDto {
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10))
  categoryId: number = Number(`${process.env.GOODS_CATEGORY_ID}`);

  @IsBooleanString()
  myPost: string = 'false';

  @IsBooleanString()
  myVote: string = 'false';
}
