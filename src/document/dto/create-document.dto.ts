import { IsString, IsDate, IsInt, IsOptional } from 'class-validator';

export default class CreateDocumentDto {
  @IsString()
  title: string;

  @IsString()
  context: string;

  @IsInt()
  categoryId: number;

  @IsOptional()
  @IsDate()
  voteExpire?: Date;

  @IsOptional()
  @IsInt()
  goal?: number;
}
