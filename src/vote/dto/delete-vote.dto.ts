import { IsNumber } from 'class-validator';

export default class DeleteVoteDto {
  @IsNumber()
  documentId: number;
}
