import { Transform } from 'class-transformer';
import { IsBooleanString, IsInt, Min } from 'class-validator';

export default class SizeCategoryDto {
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10))
  categoryId: number = 5;

  @IsBooleanString()
  myPost: string = 'false';

  @IsBooleanString()
  myVote: string = 'false';
}
