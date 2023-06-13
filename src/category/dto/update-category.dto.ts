import {
	IsString,
	IsInt,
	IsOptional,
  } from 'class-validator';
  
  export default class UpdateCategoryDto {
	@IsOptional()
	@IsString()
	title?: string;
  
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
  