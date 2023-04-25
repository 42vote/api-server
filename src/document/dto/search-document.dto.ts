import { IsIn, IsInt, IsOptional, IsString } from "class-validator";

export default class SearchDocumentDto {
	@IsInt()
	categoryId: number;
	
	@IsInt()
	listSize: number;

	@IsInt()
	listIndex: number;

	@IsOptional()
	myPost: boolean;

	@IsOptional()
	myVote: boolean;	
}