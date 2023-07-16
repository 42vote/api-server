import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export default class SearchParticipantDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  documentId?: number;

  @IsString()
  @IsOptional()
  authorIntraId?: string;

  @IsString()
  @IsOptional()
  voterIntraId?: string;

  @IsBoolean()
  @IsOptional()
  anonymousVote?: boolean;
}
