import { IsString, IsDate, IsInt, IsOptional } from 'class-validator';

export default class CreateDocumentDto {
  // @IsString()
  title: string;

  // @IsString()
  context: string;

  // @IsInt()
  categoryId: number;

  // @IsOptional()
  // @IsInt()
  goal?: number;
}


