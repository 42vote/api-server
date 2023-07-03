import {
	IsString,
	IsInt,
	IsOptional,
	ArrayMinSize,
	ArrayMaxSize,
  } from 'class-validator';
  
  export default class UpdateDocumentDto {
	@IsString()
	title: string;

	@IsString()
	context: string;
  
	@IsOptional()
	@IsInt()
	goal?: number;
  
	@IsString({ each: true })
	@ArrayMinSize(1)
	@ArrayMaxSize(5)
	image: string[];

	@IsString({ each: true })
	@ArrayMinSize(1)
	@ArrayMaxSize(5)
	imageName: string[];
  }
  