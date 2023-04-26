import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export default class SearchVoteDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  documentId?: number;

  @IsString()
  @IsOptional()
  intraId?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  userId?: number;
}
