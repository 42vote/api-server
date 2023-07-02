import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export default class SearchStatCategoryDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  categoryId?: number;
}
