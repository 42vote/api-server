import {
  IsString,
  IsInt,
  IsOptional,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

export default class CreateDocumentDto {
  @IsString()
  title: string;

  @IsString()
  context: string;

  @IsInt()
  categoryId: number;

  @IsOptional()
  @IsInt()
  goal?: number;

  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  image: string[];
}
