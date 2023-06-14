import {
	IsString,
	IsInt,
	IsOptional,
  } from 'class-validator';
import IsValidDate from './date-validator';
  
  export default class UpdateCategoryDto {
	@IsOptional()
	@IsString()
	title?: string;
  
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
  