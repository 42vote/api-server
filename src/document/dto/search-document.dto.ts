import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export default class SearchDocumentDto {
  @IsInt()
  categoryId: number;

  @IsOptional()
  @IsInt()
  listSize?: number;

  @IsInt()
  listIndex: number;
}
