import { Transform } from 'class-transformer';
import { IsBooleanString, IsInt, IsPositive, Min } from 'class-validator';

export default class SearchDocumentDto {
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10))
  categoryId: number = 5;

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
