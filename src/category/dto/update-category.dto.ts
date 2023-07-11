import {
  IsString,
  IsInt,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import IsValidDate from './date-validator';

export default class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsValidDate()
  voteStart?: Date;

  @IsOptional()
  @IsValidDate()
  voteExpire?: Date;

  @IsOptional()
  @IsValidDate()
  docStart?: Date;

  @IsOptional()
  @IsValidDate()
  docExpire?: Date;

  @IsOptional()
  @IsBoolean()
  whitelistOnly?: boolean;

  @IsOptional()
  @IsString({ each: true })
  whitelist?: string[];

  @IsOptional()
  @IsInt()
  goal?: number;

  @IsOptional()
  @IsNumber()
  sort?: number;
}
