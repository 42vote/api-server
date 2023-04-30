import {
  IsString,
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
} from 'class-validator';

export default class CreateCategoryDto {
  @IsString()
  title: string;

  @IsBoolean()
  multipleVote: boolean;

  @IsBoolean()
  anonymousVote: boolean;

  @IsOptional()
  @IsString()
  voteExpire?: Date;

  @IsOptional()
  @IsString()
  docExpire?: Date;

  @IsOptional()
  @IsInt()
  goal?: number;
}
