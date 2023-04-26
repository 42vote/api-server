import { IsNumber } from 'class-validator';

export default class CreateVoteDto {
  @IsNumber()
  documentId: number;
}
