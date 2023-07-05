import {
  IsString,
  IsInt,
  IsOptional,
  ArrayMinSize,
  ArrayMaxSize,
  Length,
} from 'class-validator';

export default class CreateDocumentDto {
  @IsString()
  @Length(1, 42)
  title: string;

  @IsString()
  @Length(10, 500)
  context: string;

  @IsInt()
  categoryId: number;

  @IsOptional()
  @IsInt()
  goal?: number;

  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  image: string[];

  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  imageName: string[];
}
