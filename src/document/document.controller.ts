import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import CreateDocumentDto from './dto/create-document.dto';
import SearchDocumentDto from './dto/search-document.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('document')
// @UseGuards(AuthGuard)
export class DocumentController {
  constructor(readonly docService: DocumentService) {}

  @Get()
  searchDocument(
    @Query('categoryId') categoryId: number = 0,
    @Query('listIndex') listIndex: number = 0,
    @Query('listSize') listSize: number = 5,
    @Query('myPost') myPost: string = 'false',
    @Query('myVote') myVote: string = 'false',
  ) {
    const searchDto = new SearchDocumentDto();
    searchDto.categoryId = categoryId;
    searchDto.listIndex = listIndex;
    searchDto.listSize = listSize;
    searchDto.myPost = myPost === 'true' ? true : false;
    searchDto.myVote = myVote === 'true' ? true : false;

    return this.docService.searchDoc(searchDto);
  }

  @Get(':document_id')
  detailDocument(
    @Param('document_id') documentId: number,
    @Req() req: Request,
  ) {
    return this.docService.detailDoc(documentId);
  }

  @Post()
  // creatDocument(@Body() body: CreateDocumentDto, @Req() req: Requeust ) {
  creatDocument(@Body() body: CreateDocumentDto) {
    const token = {
      intraId: 'yachoi',
      isAdmin: false,
      wallet: 10,
    };
    return this.docService.createDoc(body, token);
    // return this.docService.createDoc(body, req);
  }

  @Delete(':document_id')
  deleteDocument(@Param('document_id') documentId: number) {
    return this.docService.deleteDoc(documentId);
  }
}
