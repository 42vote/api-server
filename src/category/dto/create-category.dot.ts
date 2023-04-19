import { IsString, IsBoolean, IsDate, IsInt, IsOptional } from 'class-validator';

export default class CreateCategoryDto {
  @IsString()
  title: string;

  @IsBoolean()
  multipleVote: boolean;

  @IsBoolean()
  anonymousVote: boolean;

  @IsOptional()
  @IsDate()
  voteExpire?: Date;

  @IsOptional()
  @IsDate()
  docExpire?: Date;

  @IsOptional()
  @IsInt()
  goal?: number;
}