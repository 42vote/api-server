import { Transform } from 'class-transformer';
import {
  IsBooleanString,
  IsIn,
  IsInt,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import * as dotenv from 'dotenv';

dotenv.config();
export default class SearchDocumentDto {
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10))
  categoryId: number = Number(`${process.env.GOODS_CATEGORY_ID}`);

  @IsString()
  @IsIn(['true', 'false', 'all'])
  expired?: string = 'false';

  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10))
  listIndex: number = 0;

  @IsInt()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10))
  listSize: number = 5;

  @IsBooleanString()
  myPost: string = 'false';

  @IsBooleanString()
  myVote: string = 'false';
}
