import {
  IsString,
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
} from 'class-validator';
import IsValidDate from './date-validator';

export default class CreateCategoryDto {
  @IsString()
  title: string;

  @IsBoolean()
  multipleVote: boolean;

  @IsBoolean()
  anonymousVote: boolean;

  @IsOptional()
  @IsValidDate()
  voteExpire?: Date;

  @IsOptional()
  @IsValidDate()
  docExpire?: Date;

  @IsOptional()
  @IsInt()
  goal?: number;
}
